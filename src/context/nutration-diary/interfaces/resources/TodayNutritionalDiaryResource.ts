export interface TodayNutritionalDiaryResource {
    diaryId: string | null;
    date: Date;
    totalIronAbsorbed: number;
    foodEntries: any[];
}