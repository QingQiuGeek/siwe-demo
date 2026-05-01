import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

const scheme = window.location.protocol.slice(0, -1);
const domain = window.location.host;
const origin = window.location.origin;
const provider = new BrowserProvider(window.ethereum);

const profileElm = document.getElementById('profile');
const noProfileElm = document.getElementById('noProfile');
const welcomeElm = document.getElementById('welcome');

const ensLoaderElm = document.getElementById('ensLoader');
const ensContainerElm = document.getElementById('ensContainer');
const ensTableElm = document.getElementById('ensTable');

let address;

const BACKEND_ADDR = 'http://localhost:3000';
async function createSiweMessage(address, statement) {
	const res = await fetch(`${BACKEND_ADDR}/nonce`, {
		credentials: 'include',
	});
	const message = new SiweMessage({
		scheme,
		domain,
		address,
		statement,
		uri: origin,
		version: '1',
		chainId: '1',
		nonce: await res.text(),
	});
	return message.prepareMessage();
}

function connectWallet() {
	provider
		.send('eth_requestAccounts', [])
		.catch(() => console.log('user rejected request'));
}

async function signInWithEthereum() {
	const signer = await provider.getSigner();
	profileElm.classList = 'hidden';
	noProfileElm.classList = 'hidden';
	welcomeElm.classList = 'hidden';

	address = await signer.getAddress();
	const message = await createSiweMessage(
		address,
		'Sign in with Ethereum to the app.',
	);
	const signature = await signer.signMessage(message);

	const res = await fetch(`${BACKEND_ADDR}/verify`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ message, signature }),
		credentials: 'include',
	});

	if (!res.ok) {
		console.error(`Failed in getInformation: ${res.statusText}`);
		return;
	}
	console.log(await res.text());

	displayENSProfile();
}

async function getInformation() {
	const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
		credentials: 'include',
	});

	if (!res.ok) {
		console.error(`Failed in getInformation: ${res.statusText}`);
		return;
	}

	let result = await res.text();
	console.log(result);
	address = result.split(' ')[result.split(' ').length - 1];
	displayENSProfile();
}

// 前端直接使用 provider.lookupAddress(address) 查询链上只读数据，如 ENS 名称、头像和文本记录（ email、 url、 description、 com.twitter），并把结果渲染到页面表格。
async function displayENSProfile() {
	// 给它一个钱包地址（比如 0x...），它会查询链上是否有人把 ENS 名称（比如 vitalik.eth）指向这个地址。
	const ensName = await provider.lookupAddress(address);

	if (ensName) {
		profileElm.classList = '';

		welcomeElm.innerHTML = `Hello, ${ensName}`;
		let avatar = await provider.getAvatar(ensName);
		if (avatar) {
			welcomeElm.innerHTML += ` <img class="avatar" src=${avatar}/>`;
		}

		ensLoaderElm.innerHTML = 'Loading...';
		ensTableElm.innerHTML.concat(
			`<tr><th>ENS Text Key</th><th>Value</th></tr>`,
		);
		// 查询 ENS 名称关联的头像 URL（可能是一个 IPFS 链接或 HTTP URL）。
		const resolver = await provider.getResolver(ensName);

		const keys = ['email', 'url', 'description', 'com.twitter'];
		ensTableElm.innerHTML += `<tr><td>name:</td><td>${ensName}</td></tr>`;
		for (const key of keys)
			ensTableElm.innerHTML += `<tr><td>${key}:</td><td>${await resolver.getText(key)}</td></tr>`;
		ensLoaderElm.innerHTML = '';
		ensContainerElm.classList = '';
	} else {
		welcomeElm.innerHTML = `Hello, ${address}`;
		noProfileElm.classList = '';
	}

	welcomeElm.classList = '';
}

const connectWalletBtn = document.getElementById('connectWalletBtn');
const siweBtn = document.getElementById('siweBtn');
const infoBtn = document.getElementById('infoBtn');
connectWalletBtn.onclick = connectWallet;
siweBtn.onclick = signInWithEthereum;
infoBtn.onclick = getInformation;
