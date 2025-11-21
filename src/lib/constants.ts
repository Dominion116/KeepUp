export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

export const getCurrentUnixDay = () => {
  return BigInt(Math.floor(Date.now() / 86_400_000));
};

