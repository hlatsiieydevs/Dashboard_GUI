export function getMoonPhase(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 3) {
        year--;
        month += 12;
    }
    let a = Math.floor(year / 100);
    let b = Math.floor(a / 4);
    let c = 2 - a + b;
    let e = Math.floor(365.25 * (year + 4716));
    let f = Math.floor(30.6001 * (month + 1));
    let jd = c + day + e + f - 1524.5;
    let daysSinceNew = jd - 2451549.5;
    let newMoons = daysSinceNew / 29.53;
    let phase = newMoons - Math.floor(newMoons);
    
    if (phase < 0.03) return 'New Moon';
    if (phase < 0.22) return 'Waxing Crescent';
    if (phase < 0.28) return 'First Quarter';
    if (phase < 0.47) return 'Waxing Gibbous';
    if (phase < 0.53) return 'Full Moon';
    if (phase < 0.72) return 'Waning Gibbous';
    if (phase < 0.78) return 'Last Quarter';
    if (phase < 0.97) return 'Waning Crescent';
    return 'New Moon';
}

export const MOON_PATHS = {
    'New Moon': '',
    'Waxing Crescent': 'M 50 5 A 45 45 0 0 1 50 95 A 25 45 0 0 0 50 5 Z',
    'First Quarter': 'M 50 5 A 45 45 0 0 1 50 95 A 0 45 0 0 0 50 5 Z',
    'Waxing Gibbous': 'M 50 5 A 45 45 0 0 1 50 95 A 25 45 0 0 1 50 5 Z',
    'Full Moon': 'M 50 5 A 45 45 0 0 1 50 95 A 45 45 0 0 1 50 5 Z',
    'Waning Gibbous': 'M 50 5 A 45 45 0 0 0 50 95 A 25 45 0 0 0 50 5 Z',
    'Last Quarter': 'M 50 5 A 45 45 0 0 0 50 95 A 0 45 0 0 1 50 5 Z',
    'Waning Crescent': 'M 50 5 A 45 45 0 0 0 50 95 A 25 45 0 0 1 50 5 Z'
};

export function getMoonEventColor(phaseName, date) {
    if (phaseName !== 'Full Moon') return null;
    const month = date.getMonth() + 1;
    if (month === 4) return 'rgba(255, 182, 193, 0.4)'; // Pink Moon
    if (month === 10) return 'rgba(220, 20, 60, 0.4)'; // Blood Moon
    return null;
}
