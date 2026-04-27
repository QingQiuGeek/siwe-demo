const siwe = require('siwe');

const scheme = 'https';
const domain = 'localhost';
const origin = 'https://localhost/login';

/**

EIP-4361 是 SIWE 的标准，全称可以理解为“ Sign-In with Ethereum 的登录消息格式规范”。
它规定了登录消息应该长什么样，常见字段包括：
domain
address
statement
uri
version
chainId
nonce
issuedAt

*/
function createSiweMessage(address, statement) {
	const siweMessage = new siwe.SiweMessage({
		scheme,
		domain,
		address,
		statement,
		uri: origin,
		version: '1',
		chainId: '1',
	});
	return siweMessage.prepareMessage();
}

console.log(
	createSiweMessage(
		'0x6Ee9894c677EFa1c56392e5E7533DE76004C8D94',
		'This is a test statement.',
	),
);
