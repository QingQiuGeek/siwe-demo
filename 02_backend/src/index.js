import cors from 'cors';
import express from 'express';
import { generateNonce, SiweMessage } from 'siwe';

const app = express();
app.use(express.json());
app.use(cors());

// 获取 nonce 的接口，拿到一个随机字符串 nonce，防止重放攻击，保证每次登录请求都是唯一的。
// 授权前调用。用户点击 "Sign-in with Ethereum" 按钮，前端调用 signInWithEthereum()，执行 createSiweMessage()，其中第一步是向后端获取 nonce，放入 SIWE 消息内容
app.get('/nonce', function (_, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.send(generateNonce());
});

// 验证登录消息的接口，验证用户签名的登录消息是否合法。它会拿到前端传来的 message 和 signature，使用 siwe 库来验证签名是否正确。

// 钱包弹窗 → 授权。 SIWE 消息构建完成后，调用 signer.signMessage(message)，钱包弹出签名窗口，显示 SIWE 消息（包含之前拿到的 nonce）用户确认签名（在钱包里点确认授权）
app.post('/verify', async function (req, res) {
	const { message, signature } = req.body;
	const siweMessage = new SiweMessage(message);
	try {
		await siweMessage.verify({ signature });
		res.send(true);
	} catch {
		res.send(false);
	}
});

app.listen(3000);
