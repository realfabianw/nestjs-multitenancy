// https://github.com/drizzle-team/drizzle-orm/discussions/1499
export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
  if (values.length !== 1)
    throw new Error('Found non unique or inexistent value');
  return values[0]!;
};
