export const ensureBitcoinBalance = async (client: any, blocks: number = 101) => {
  const balance = await client.getBalance()
  if (balance === 0) await client.generate(blocks)
}
