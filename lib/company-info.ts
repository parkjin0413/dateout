export type CompanyInfo = {
  name: string;
  ceo: string;
  address: string;
  bizNo: string;
  phone: string;
  email: string;
  // 사업자등록증 파일. jpg는 화면 미리보기 겸 다운로드, pdf는 다운로드 전용.
  // 파일은 public/biz-cert/ 아래에 이 경로대로 넣으면 됩니다.
  certJpg: string;
  certPdf: string;
};

// 회사정보 페이지에 표시되는 3개 법인 기본정보. 값이 바뀌면 이 파일만 수정하면 됩니다.
// bizNo·phone은 화면에는 하이픈 포함으로 보여주고, 복사할 때는 숫자만 복사합니다.
export const COMPANY_INFO: CompanyInfo[] = [
  {
    name: "강산이엔지",
    ceo: "장준호",
    address: "서울시 도봉구 도봉로110라길 70-11, 3층",
    bizNo: "217-81-18446",
    phone: "02-3296-0482",
    email: "kangsaneng@daum.net",
    certJpg: "/biz-cert/kangsaneng.jpg",
    certPdf: "/biz-cert/kangsaneng.pdf",
  },
  {
    name: "엘가디자인",
    ceo: "조은아",
    address: "서울시 도봉구 덕릉로57길 30, 303호",
    bizNo: "161-88-01409",
    phone: "02-998-0481",
    email: "elgaeng21@daum.net",
    certJpg: "/biz-cert/elga.jpg",
    certPdf: "/biz-cert/elga.pdf",
  },
  {
    name: "더패스트",
    ceo: "장윤정",
    address: "경기 양주시 천보산로 71번길 22-17, 이동",
    bizNo: "501-87-02496",
    phone: "031-868-8878",
    email: "thefast21@daum.net",
    certJpg: "/biz-cert/thefast.jpg",
    certPdf: "/biz-cert/thefast.pdf",
  },
];
