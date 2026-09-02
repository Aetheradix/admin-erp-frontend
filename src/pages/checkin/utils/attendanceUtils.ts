export interface BreakItem {
    id: string | number;
    label: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
}

export interface DayDetailedRecord {
    id: string | number;
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Holiday' | 'Weekend' | 'Half Day';
    shift: string; // e.g. "09:00 AM – 06:00 PM"
    shiftStart: string; // e.g. "09:00 AM"
    shiftEnd: string; // e.g. "06:00 PM"
    checkIn?: string; // e.g. "09:17 AM"
    checkOut?: string; // e.g. "06:08 PM"
    breaks: BreakItem[];
    totalBreakMinutes: number;
    grossWorkingHours: number; // decimal hours
    netWorkingHours: number; // decimal hours
    isLate: boolean;
    lateMinutes: number;
    earlyDepartureMinutes: number;
    overtimeHours: number;
    location?: string;
    notes?: string;
}

export interface MonthAttendanceSummary {
    presentDays: number;
    lateDays: number;
    absentDays: number;
    leaveDays: number;
    holidayDays: number;
    weekendDays: number;
    avgWorkingHours: string;
    avgBreakMinutes: number;
    totalOvertimeHours: number;
    attendancePercentage: number;
}

// Convert "09:15 AM" or "18:30" to minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');

    let [hoursStr, minutesStr] = clean.replace(/(AM|PM)/g, '').trim().split(':');
    let hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

// Format decimal hours to readable string like "5h 42m" or "0h 0m"
export function formatHoursAndMinutes(decimalHours: number): string {
    if (!decimalHours || decimalHours <= 0) return '0h 0m';
    const totalMinutes = Math.round(decimalHours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
}

// Format minutes to readable string like "32m" or "1h 15m"
export function formatMinutes(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes <= 0) return '0m';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
}

// Generate realistic mock records for a full month if backend data is incomplete
export function generateMonthAttendanceRecords(year: number, monthZeroIndexed: number): DayDetailedRecord[] {
    const records: DayDetailedRecord[] = [];
    const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthZeroIndexed, day);
        const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
        const dateStr = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Weekend check
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            records.push({
                id: `day-${dateStr}`,
                date: dateStr,
                status: 'Weekend',
                shift: '09:00 AM – 06:00 PM',
                shiftStart: '09:00 AM',
                shiftEnd: '06:00 PM',
                breaks: [],
                totalBreakMinutes: 0,
                grossWorkingHours: 0,
                netWorkingHours: 0,
                isLate: false,
                lateMinutes: 0,
                earlyDepartureMinutes: 0,
                overtimeHours: 0,
            });
            continue;
        }

        // Specific Fixed Holidays or Leaves for demo realism
        if (day === 15) {
            records.push({
                id: `day-${dateStr}`,
                date: dateStr,
                status: 'Holiday',
                shift: '09:00 AM – 06:00 PM',
                shiftStart: '09:00 AM',
                shiftEnd: '06:00 PM',
                breaks: [],
                totalBreakMinutes: 0,
                grossWorkingHours: 0,
                netWorkingHours: 0,
                isLate: false,
                lateMinutes: 0,
                earlyDepartureMinutes: 0,
                overtimeHours: 0,
                notes: 'Company Foundation Day',
            });
            continue;
        }

        if (day === 8) {
            records.push({
                id: `day-${dateStr}`,
                date: dateStr,
                status: 'On Leave',
                shift: '09:00 AM – 06:00 PM',
                shiftStart: '09:00 AM',
                shiftEnd: '06:00 PM',
                breaks: [],
                totalBreakMinutes: 0,
                grossWorkingHours: 0,
                netWorkingHours: 0,
                isLate: false,
                lateMinutes: 0,
                earlyDepartureMinutes: 0,
                overtimeHours: 0,
                notes: 'Approved Casual Leave',
            });
            continue;
        }

        // Randomize Present vs Late for past days
        const isLate = day % 4 === 0;
        const lateMins = isLate ? 15 + (day % 3) * 7 : 0;
        const checkInHour = isLate ? 9 : 8;
        const checkInMin = isLate ? lateMins : 50 + (day % 10);
        const checkInTimeStr = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')} AM`;

        const checkOutMin = 5 + (day % 25);
        const checkOutTimeStr = `06:${String(checkOutMin).padStart(2, '0')} PM`;

        const breaks: BreakItem[] = [
            {
                id: `b1-${day}`,
                label: 'Coffee Break',
                startTime: '11:10 AM',
                endTime: '11:22 AM',
                durationMinutes: 12,
            },
            {
                id: `b2-${day}`,
                label: 'Lunch Break',
                startTime: '01:15 PM',
                endTime: '01:45 PM',
                durationMinutes: 30,
            },
        ];

        const totalBreakMinutes = 42;
        const grossWorkingHours = 9.2;
        const netWorkingHours = 8.5;
        const overtimeHours = day % 5 === 0 ? 1.2 : 0;

        records.push({
            id: `day-${dateStr}`,
            date: dateStr,
            status: isLate ? 'Late' : 'Present',
            shift: '09:00 AM – 06:00 PM',
            shiftStart: '09:00 AM',
            shiftEnd: '06:00 PM',
            checkIn: checkInTimeStr,
            checkOut: checkOutTimeStr,
            breaks,
            totalBreakMinutes,
            grossWorkingHours,
            netWorkingHours,
            isLate,
            lateMinutes: lateMins,
            earlyDepartureMinutes: 0,
            overtimeHours,
            location: 'Main Office',
        });
    }

    return records;
}

// Compute aggregate metrics from a month's records
export function calculateMonthSummary(records: DayDetailedRecord[]): MonthAttendanceSummary {
    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let holidayDays = 0;
    let weekendDays = 0;
    let totalNetHours = 0;
    let totalBreakMins = 0;
    let totalOvertimeHours = 0;

    records.forEach((r) => {
        switch (r.status) {
            case 'Present':
                presentDays++;
                break;
            case 'Late':
                presentDays++;
                lateDays++;
                break;
            case 'Absent':
                absentDays++;
                break;
            case 'On Leave':
                leaveDays++;
                break;
            case 'Holiday':
                holidayDays++;
                break;
            case 'Weekend':
                weekendDays++;
                break;
            case 'Half Day':
                presentDays += 0.5;
                break;
        }

        if (r.netWorkingHours > 0) {
            totalNetHours += r.netWorkingHours;
        }
        totalBreakMins += r.totalBreakMinutes || 0;
        totalOvertimeHours += r.overtimeHours || 0;
    });

    const workingDaysCount = Math.max(1, presentDays);
    const avgWorkingHours = formatHoursAndMinutes(totalNetHours / workingDaysCount);
    const avgBreakMinutes = Math.round(totalBreakMins / workingDaysCount);

    const totalExpectedWorkingDays = records.length - (weekendDays + holidayDays);
    const attendancePercentage = totalExpectedWorkingDays > 0
        ? Math.round((presentDays / totalExpectedWorkingDays) * 100)
        : 100;

    return {
        presentDays,
        lateDays,
        absentDays,
        leaveDays,
        holidayDays,
        weekendDays,
        avgWorkingHours,
        avgBreakMinutes,
        totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
        attendancePercentage,
    };
}
