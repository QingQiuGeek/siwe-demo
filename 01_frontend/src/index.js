import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

// window.location 是浏览器里“当前页面地址”的对象。它表示正在访问的 URL，并且可以读到各个部分，也可以用来跳转页面。
// 拿到协议，如 https/http
const scheme = window.location.protocol.slice(0, -1);
// 拿到域名 + 端口，如 localhost:3000
const domain = window.location.host;
// 拿源地址（协议 + 主机 + 端口），比如 https://localhost:8080
const origin = window.location.origin;

// 用 ethers.js 创建一个“以浏览器钱包为底层”的区块链提供器对象。
// BrowserProvider 是 ethers v6 提供的类，专门用来包装浏览器注入的钱包对象（比如 MetaMask）。
// window.ethereum 这是钱包插件注入到网页里的 EIP-1193 标准对象，负责和钱包通信（请求账户、切链、签名、发交易等）。
const provider = new BrowserProvider(window.ethereum);

async function createSiweMessage(address, statement) {
	const network = await provider.getNetwork();
	const message = new SiweMessage({
		scheme,
		domain,
		address,
		statement,
		uri: origin,
		version: '1',
		chainId: Number(network.chainId),
	});
	return message.prepareMessage();
}

// 定义一个“连接钱包”函数，可以绑定到按钮的 onclick。
async function connectWallet() {
	// 获取网络，用了 await 就要用 async
	const chainId = await provider.send('eth_chainId', []);
	console.log('eth_chainId：' + chainId);

	provider
		// 通过 EIP-1193 RPC 方法 eth_requestAccounts 向钱包请求账户权限，钱包会弹窗让用户“连接”或“拒绝”。
		.send('eth_requestAccounts', [])
		// 如果用户同意链接，钱包会返回账户数组，后续 provider.getSigner() 可正常拿到签名者。
		// 如果请求失败（最常见是用户点了拒绝），进入 catch，打印提示
		.catch(() => console.log('user rejected request'));
}

// 钱包链接成功后，才能执行该签名函数
async function signInWithEthereum() {
	// 从浏览器钱包里拿到当前账户对应的签名器对象 signer。这个对象代表“谁来签名”
	const signer = await provider.getSigner();
	// signer.getAddress() 返回的是 Promise（异步结果），所以要 await 等它拿到地址字符串。
	const address = await signer.getAddress();
	const message = await createSiweMessage(
		address,
		'Sign in with Ethereum to the app.',
	);
	console.log(await signer.signMessage(message));
}

// Buttons from the HTML page
const connectWalletBtn = document.getElementById('connectWalletBtn');
const siweBtn = document.getElementById('siweBtn');
connectWalletBtn.onclick = connectWallet;
siweBtn.onclick = signInWithEthereum;
