const Router = require('koa-router');
const router = new Router();
const ByIDWithdraw = require('../../services/coin');
const PositiveIntegerValidator = require('../../validators/validator');

// 提现的接口
router.get("/v1/:id/extract", async (ctx)=>{
  const v = new PositiveIntegerValidator().validate(ctx);
  console.log(`v.get("path.id")--->`,v.get("path.id"));
  await ByIDWithdraw(v.get("path.id"));
  throw new global.errs.Success();
});

// 异常处理， 异常处理的应用
module.exports = router;