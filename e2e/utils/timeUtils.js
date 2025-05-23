/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default function getTimeDifferenceInMinutes(timeString1, timeString2) {
  const date1 = new Date(timeString1);
  const date2 = new Date(timeString2);
  const differenceInMilliseconds = date2.getTime() - date1.getTime();
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  return differenceInMinutes;
}
