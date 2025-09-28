// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
var popbill = require('popbill');
const app = express();
const path = require('path');
app.set('views', path.join(__dirname, 'views')); // 템플릿 폴더
app.set('view engine', 'ejs');


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 생략..

var popbill = require('popbill');

popbill.config({

    // 링크아이디
    LinkID: 'TAULAPI',

    // 비밀키
    SecretKey: 'flPQQ9rGSa2psxZQ8Yr4IxAASafmTrucjDbXn5R0DuQ',

    // 연동환경 설정, true-테스트, false-운영(Production), (기본값:false)
    IsTest: true,

    // 통신 IP 고정, true-사용, false-미사용, (기본값:true)
    IPRestrictOnOff: true,

    // 팝빌 API 서비스 고정 IP 사용여부, 기본값(false)
    UseStaticIP: false,

    // 로컬시스템 시간 사용여부, true-사용, false-미사용, (기본값:true)
    UseLocalTimeYN: true,

    defaultErrorHandler: function (Error) {
        console.log('Error Occur : [' + Error.code + '] ' + Error.message);
    }

});

// 전자세금계산서 서비스 객체 초기화
var taxinvoiceService = popbill.TaxinvoiceService();

// 계좌조회 서비스 객체 초기화
var easyFinBankService = popbill.EasyFinBankService();

// 생략..
/*
 * 팝빌에 등록된 계좌의 거래내역 수집을 요청합니다.
 * - 검색기간은 현재일 기준 90일 이내로만 요청할 수 있습니다.
 * - 수집 요청후 반환받은 작업아이디(JobID)의 유효시간은 1시간 입니다.
 */
app.get('/getBankAccountInfo', function (req, res, next) {
  const corpNum = '1498802941';          // '-' 없이 10자리
  const bankCode = '0003';
  const accountNumber = '02716229704021';
  const userID = 'TAULAPI';              // 팝빌 아이디

  easyFinBankService.getBankAccountInfo(
    corpNum,
    bankCode,
    accountNumber,
    userID,
    // 성공 콜백
    function (info) {
      // info 예: { bankCode, accountNumber, accountName, ... }
      res.json({ ok: true, info });
    },
    // 실패 콜백
    function (err) {
      res.status(500).json({
        ok: false,
        code: err.code,
        message: err.message,
      });
    }
  );

});
app.get('/requestJob', function (req, res, next) {

    // 팝빌회원 사업자번호, '-' 제외 10자리
    var testCorpNum = '1498802941';

    // 기관코드
    var bankCode = '0003';

    // 계좌번호
    var accountNumber = '02716229704021';

    // 시작일자, 날짜형식(yyyyMMdd)
    var SDate = '20250920';

    // 종료일자, 날짜형식(yyyyMMdd)
    var EDate = '20250926';


    easyFinBankService.requestJob(testCorpNum, bankCode, accountNumber, SDate, EDate,
        function (jobID) {
            res.render('response', {path: req.path, result: jobID})
        }, function (Error) {
            console.log('오류 코드 :' + Error.code);
            console.log('오류 메시지 :' + Error.message);
        });
});

app.get('/registIssue', function (req, res, next) {

    // 팝빌회원 사업자번호, '-' 제외 10자리
    var testCorpNum = '1498802941';

    // 문서번호, 1~24자리 영문,숫자,'-','_' 조합으로 사업자별로 중복되지 않도록 구성
    var mgtKey = '20250314-002131';

    // 세금계산서 항목
    var Taxinvoice = {

        // [필수] 작성일자, 날짜형식 yyyyMMdd
        writeDate: '20250926',

        // [필수] 과금방향, (정과금, 역과금) 중 기재, 역과금은 역발행의 경우만 가능
        chargeDirection: '정과금',

        // [필수] 발행형태, (정발행, 역발행, 위수탁) 중 기재
        issueType: '정발행',

        // [필수] (영수, 청구, 없음) 중 기재
        purposeType: '영수',

        // [필수] 과세형태, (과세, 영세, 면세) 중 기재
        taxType: '과세',


        /************************************************************************
         *                              공급자 정보
         **************************************************************************/

        // [필수] 공급자 사업자번호, '-' 제외 10자리
        invoicerCorpNum: testCorpNum,

        // [정발행시 필수] 문서번호, 1~24자리 숫자,영문,'-','_' 조합으로 사업자별로 중복되지 않도록 구성
        invoicerMgtKey: mgtKey,

        // 공급자 종사업장 식별번호, 필요시 기재, 4자리 숫자
        invoicerTaxRegID: '',

        // [필수] 공급자 상호
        invoicerCorpName: '공급자 상호',

        // [필수] 대표자 성명
        invoicerCEOName: '대표자 성명',

        // 공급자 주소
        invoicerAddr: '공급자 주소',

        // 공급자 종목
        invoicerBizClass: '공급자 업종',

        // 공급자 업태
        invoicerBizType: '공급자 업태',

        // 공급자 담당자명
        invoicerContactName: '공급자 담당자명',

        // 공급자 연락처
        invoicerTEL: '070-4304-2991',

        // 공급자 휴대폰번호
        invoicerHP: '010-000-111',

        // 공급자 메일주소
        invoicerEmail: 'test@test.com',

        // 정발행시 알림문자 전송여부
        // - 문자전송지 포인트가 차감되며, 전송실패시 포인트 환불처리됩니다.
        invoicerSMSSendYN: false,


        /************************************************************************
         *                           공급받는자 정보
         **************************************************************************/

        // [필수] 공급받는자 유형, (사업자, 개인, 외국인) 중 기재
        invoiceeType: '사업자',

        // [필수] 공급받는자 사업자번호, '-'제외 10자리
        invoiceeCorpNum: '8888888888',

        // [역발행시 필수] 공급받는자 문서번호
        invoiceeMgtKey: '',

        // 공급받는자 종사업장 식별번호, 필요시 기재, 4자리 숫자
        invoiceeTaxRegID: '',

        // [필수] 공급받는자 상호
        invoiceeCorpName: '공급받는자 상호',

        // [필수] 공급받는자 대표자 성명
        invoiceeCEOName: '공급받는자 대표자 성명',

        // 공급받는자 주소
        invoiceeAddr: '공급받는자 주소',

        // 공급받는자 종목
        invoiceeBizClass: '공급받는자 종목',

        // 공급받는자 업태
        invoiceeBizType: '공급받는자 업태',

        // 공급받는자 담당자명
        invoiceeContactName1: '공급받는자 담당자명',

        // 공급받는자 연락처
        invoiceeTEL1: '010-111-222',

        // 공급받는자 휴대폰번호
        invoiceeHP1: '070-111-222',

        // 공급받는자 이메일 주소
        // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
        // 실제 거래처의 메일주소가 기재되지 않도록 주의
        invoiceeEmail1: 'test2@test.com',

        // 역발행시 알림문자 전송여부
        // - 문자전송지 포인트가 차감되며, 전송실패시 포인트 환불처리됩니다.
        invoiceeSMSSendYN: false,


        /************************************************************************
         *                           세금계산서 기재정보
         **************************************************************************/

        // [필수] 공급가액 합계
        supplyCostTotal: '10000',

        // [필수] 세액합계
        taxTotal: '1000',

        // [필수] 합계금액 (공급가액 합계 + 세액 합계)
        totalAmount: '11000',

        // 기재 상 '일련번호'' 항목
        serialNum: '123',

        // 기재 상 '현금'' 항목
        cash: '',

        // 기재 상 '수표' 항목
        chkBill: '',

        // 기재 상 '어음' 항목
        note: '',

        // 기재 상 '외상' 항목
        credit: '',

        // 기재 상 '비고' 항목
        remark1: '비고',
        remark2: '비고2',
        remark3: '비고3',

        // 기재 상 '권' 항목, 최대값 32767
        kwon: '',

        // 기재 상 '호' 항목, 최대값 32767
        ho: '',

        // 사업자등록증 이미지 첨부여부
        businessLicenseYN: false,

        // 통장사본 이미지 첨부여부
        bankBookYN: false,


        /************************************************************************
         *                           상세항목(품목) 정보
         **************************************************************************/

        detailList: [
            {
                serialNum: 1,                // 일련번호, 1부터 순차기재
                purchaseDT: '20250314',      // 거래일자, 형식 : yyyyMMdd
                itemName: '품명1',
                spec: '규격',
                qty: '1',                    // 수량, 소수점 2자리까지 기재 가능
                unitCost: '5000',           // 단가, 소수점 2자리까지 기재 가능
                supplyCost: '5000',         // 공급가액, 소수점 기재불가, 원단위 이하는 절사하여 표현
                tax: '500',                 // 세액, 소수점 기재불가, 원단위 이하는 절사하여 표현
                remark: '비고'
            },
            {
                serialNum: 2,                // 일련번호, 1부터 순차기재
                purchaseDT: '20250314',      // 거래일자, 형식 : yyyyMMdd
                itemName: '품명2',
                spec: '규격',
                qty: '1',                    // 수량, 소수점 2자리까지 기재 가능
                unitCost: '5000',           // 단가, 소수점 2자리까지 기재 가능
                supplyCost: '5000',         // 공급가액, 소수점 기재불가, 원단위 이하는 절사하여 표현
                tax: '500',                 // 세액, 소수점 기재불가, 원단위 이하는 절사하여 표현
                remark: '비고'
            }
        ],


        /************************************************************************
         *                         수정세금계산서 기재정보
         * - 수정세금계산서를 작성하는 경우에만 값을 기재합니다.
         * - 수정세금계산서 관련 정보는 연동매뉴얼 또는 개발가이드 링크 참조
         * - [참고] 수정세금계산서 작성방법 안내 - http://blog.linkhubcorp.com/650
         **************************************************************************/

        // [수정세금계산서 발행시 필수] 수정사유코드, 수정사유에 따라 1~6 숫자 기재
        modifyCode: '',

        // [수정세금계산서 발행시 필수] 당초 국세청승인번호 기재
        orgNTSConfirmNum: '',


        /************************************************************************
         *                             추가담당자 정보
         * - 세금계산서 발행안내 메일을 수신받을 공급받는자 담당자가 다수인 경우
         * 추가 담당자 정보를 등록하여 발행안내메일을 다수에게 전송할 수 있습니다. (최대 5명)
         **************************************************************************/

        // 추가담당자 정보
        addContactList: [
            {
                // 일련번호, 1부터 순차기재
                serialNum: 1,

                // 담당자명
                contactName: '담당자 성명',

                // 담당자 메일
                email: 'test2@test.com'
            },
            {
                // 일련번호, 1부터 순차기재
                serialNum: 2,

                // 담당자명
                contactName: '담당자 성명 2',

                // 담당자 메일
                email: 'test3@test.com'
            }
        ]
    };

    taxinvoiceService.registIssue(testCorpNum, Taxinvoice,
        function (result) {
            res.render('response', { path: req.path, code: result.code, message: result.message, ntsConfirmNum: result.ntsConfirmNum });
        }, function (Error) {
            res.render('response', { path: req.path, code: Error.code, message: Error.message });
        });
});
app.get('/popbillTest', function (req, res, next) {
    const corpNum = req.query.corpNum || process.env.POPBILL_CORP_NUM;
    if (!corpNum) return res.status(400).json({ ok: false, error: 'corpNum is required' });

    // ✅ 콜백 2개(성공/실패)를 "함수"로 정확히 전달하세요.
    taxinvoiceService.getCertificateExpireDate(
        corpNum,
        (expireDate) => {
            // expireDate는 보통 'YYYYMMDD' 문자열
            res.json({ ok: true, expireDate });
        },
        (err) => {
            // PopbillError 포맷으로 응답
            res.status(500).json({ ok: false, error: (err && { code: err.code, message: err.message }) || String(err) });
        }
    );
});




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT}`);
});
