// backend/src/lib/roomState.ts

// Stores the live count of users in each room
export const roomCounts = new Map<string, number>();

export const updateRoomCount = (roomId: string, count: number) => {
  roomCounts.set(roomId, count);
};

export const getRoomCount = (roomId: string) => {
  return roomCounts.get(roomId) || 0;
};