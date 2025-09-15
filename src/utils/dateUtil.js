
import { formatTimestampByLocale } from '../locales'

export const formatTimestamp = (timestamp) => {
    return formatTimestampByLocale(timestamp)
}
export const formatTimestampFixed = (timestamp) => {
    if (typeof timestamp !== 'number') {
        return ""
    }
    if (timestamp >= 1e12 && timestamp < 1e13) {
    } else if (timestamp >= 1e9 && timestamp < 1e10) {
        timestamp *= 1000;
    } else {
        return ""
    }

    const date = new Date(timestamp);
    const pad = (n) => String(n).padStart(2, '0');
    const Y = date.getFullYear();
    const M = pad(date.getMonth() + 1);
    const D = pad(date.getDate());
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}