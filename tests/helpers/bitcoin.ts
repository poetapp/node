export const ensureBitcoinBalance = async (client: any, blocks: number = 101) => {
  const balance = await client.getBalance()
  if (balance === 0) await client.generate(blocks)
}

export const ensureBitcoinBalanceAboveMin = async (client: any, minBalance: number = 0, blocks: number = 101) => {
  const balance = await client.getBalance()
  if (balance < minBalance) await client.generate(blocks)
  else return
  await ensureBitcoinBalanceAboveMin(client, minBalance, blocks)
}
