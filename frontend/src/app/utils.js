'use client';

export const getUserExtendedName = (user_type) => {
  switch (user_type) {
    case "student": return "Student";
    case "club_manager": return "Club Manager";
    case "account_manager": return "Account Manager";
    case "cinema_manager": return "Cinema Manager";
  }
  return "";
}