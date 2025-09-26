// popbillService.js (CommonJS)
require('dotenv').config();
const { TaxinvoiceService } = require('popbill');

// 환경변수
const LINK_ID  = process.env.POPBILL_LINK_ID;
const SECRET   = process.env.POPBILL_SECRET_KEY;

// 서비스 인스턴스 생성
const taxinvoiceService = new TaxinvoiceService(LINK_ID, SECRET);

// SDK 기본 설정
taxinvoiceService.IsTest            = (process.env.POPBILL_TEST ?? 'true') === 'true';
taxinvoiceService.IPRestrictOnOff   = (process.env.POPBILL_IP_RESTRICT_ON ?? 'true') === 'true';
taxinvoiceService.UseStaticIP       = (process.env.POPBILL_USE_STATIC_IP ?? 'false') === 'true';
taxinvoiceService.UseLocalTimeYN    = (process.env.POPBILL_USE_LOCAL_TIME ?? 'true') === 'true';

// 유틸: PopbillError 포맷
function shapeError(err) {
  return {
    name: err?.name || 'PopbillError',
    code: err?.code,
    message: err?.message || String(err),
  };
}

module.exports = {
  taxinvoiceService,
  shapeError,
};
