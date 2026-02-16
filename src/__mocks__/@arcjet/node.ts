export default jest.fn(() => ({
	protect: jest.fn().mockResolvedValue({ isDenied: () => false }),
}));

export const detectBot = jest.fn();
export const shield = jest.fn();
export const tokenBucket = jest.fn();
