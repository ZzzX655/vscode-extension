const https = require("https");
const querystring = require("querystring");
const { APP_ID, APP_KEY } = require("./key.js");
function translate(text, from = "auto", to = "en") {
    return new Promise((resolve, reject) => {
        const salt = Math.floor(Math.random() * 10000); // 生成一个随机盐
        const sign = generateSignAndSalt(text, salt);
        const params = querystring.stringify({
            q: text,
            from,
            to,
            appid: APP_ID,
            salt: salt,
            sign: sign,
        });

        const options = {
            hostname: "fanyi-api.baidu.com",
            path: `/api/trans/vip/translate?${params}`,
            method: "GET",
        };

        const req = https.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                const result = JSON.parse(data);
                if (
                    result &&
                    result.trans_result &&
                    result.trans_result.length > 0
                ) {
                    resolve(result.trans_result[0].dst);
                } else {
                    reject(new Error(result.error_msg));
                }
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.end();
    });
}

function generateSignAndSalt(text, salt) {
    //对拼接起来的字符串进行MD5加密
    const rawStr = `${APP_ID}${text}${salt}${APP_KEY}`;
    const md5sum = require("crypto").createHash("md5");
    md5sum.update(rawStr);
    return md5sum.digest("hex");
}
module.exports = translate;
