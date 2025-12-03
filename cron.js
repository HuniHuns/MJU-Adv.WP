const cron = require('node-cron');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Game, User } = require('./models');
const { Op } = require('sequelize');  // 날짜 비교 연산 위함

// Gemini API 설정
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = geminiAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// AI 봇 ID 가져오기
// User 테이블에 'AI 봇'이란 사용자가 없으면 생성
async function getAIUserId() {
  try{
    const [user, created] = await User.findOrCreate({
      where: { email: 'ai_bot@balancegame.com' }, // 식별용 가짜 이메일
      defaults: {
        nickname: '🤖 AI 봇', // 화면에 표시될 닉네임
        password: 'ai_secret_password', // 로컬 로그인용 가짜 비번
        provider: 'local',
      }
    });
    if (created) console.log('✨ [System] AI 봇 계정이 생성되었습니다.');
    return user.id;
  } catch (error) {
    console.error('❌ AI 유저 조회 실패:', error);
    return null;
  }
}

// ai 게임 생성 로직
async function generateAIGame() {
  console.log('🤖 [AI 스케줄러] AI가 오늘의 주제를 고민 중입니다...');
  try {
    // (1) AI 봇 ID 가져오기
    const aiUserId = await getAIUserId();
    if (!aiUserId) return;

    // (2) 프롬포트 작성
    const prompt = `
      한국 대학생들이 좋아할만한 아주 웃기거나 선택하기 곤란한 '밸런스 게임' 주제 1개를 창작해줘.
      각 선택지는 최대 15자 이내로 간결하게 작성하고, 
      결과는 무조건 JSON 형식으로만 답변해줘. 마크다운 기호나 다른 말은 절대 하지 마. 성적이거나 유해한 단어 및 주제는 무조건 사용금지 할께.
      {
        "title": "밸런스 게임 질문 제목(예: 평생 한 가지만 먹기 vs 매일 다른 것만 먹기)",
        "optionA": "선택지 A",
        "optionB": "선택지 B"
      }
    `;

    // (3) Gemini API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // (4) 응답 전처리
    text = text.replace(/```json|```/g, '').trim();

    // (5) JSON 파싱
    const gameData = JSON.parse(text);

    // (6) Game 테이블에 새 게임 생성
    await Game.create({
      title: gameData.title,
      optionA: gameData.optionA,
      optionB: gameData.optionB,
      creatorType: 'ai',
      UserId: aiUserId,
    });

    console.log('✅ [AI 스케줄러] 오늘의 AI 밸런스 게임이 생성되었습니다:', gameData.title);
  } catch (error) {
    console.error('❌ [AI 스케줄러] AI 밸런스 게임 생성 실패:', error);
  }
}

// 서버 (재)시작 시 오늘 만든 게임 유무 체크
async function initAIGame() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 00:00:00 기준

    const existGame = await Game.findOne({
      where: {
        creatorType: 'ai',
        createdAt: {
          [Op.gte]: today,  // createdAt >= 오늘 00시
        },
      },
    });

    if(!existGame) {
      console.log('🤖 [AI 스케줄러] 오늘 생성된 AI 게임이 없습니다. 즉시 생성합니다.');
      await generateAIGame();
    } else {
      console.log('✅ [AI 스케줄러] 오늘 이미 AI 게임이 생성되어 있습니다.');
    }
  } catch (error) {
    console.error(error);
  }
}

// 스케줄러 등록 (매일 0시 실행)
cron.schedule('0 0 * * *', generateAIGame);

// 외부에서 초기화 함수를 부를 수 있게 내보냄
module.exports = initAIGame;