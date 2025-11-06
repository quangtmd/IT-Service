import { 
    MediaItem, ChatLogSession, FinancialTransaction, PayrollRecord, 
    Quotation
} from '../types';
import * as Constants from '../constants';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(error);
    }
};

// --- Services that still use LocalStorage (for smoother transition) ---

export const getMediaItems = async (): Promise<MediaItem[]> => getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS).siteMediaLibrary || [];
export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const settings = getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS);
    const newItem = { ...item, id: `media-${Date.now()}` };
    const newLibrary = [newItem, ...settings.siteMediaLibrary];
    setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, { ...settings, siteMediaLibrary: newLibrary });
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
    return newItem;
};
export const deleteMediaItem = async (id: string): Promise<boolean> => {
    const settings = getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS);
    const newLibrary = settings.siteMediaLibrary.filter(item => item.id !== id);
    setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, { ...settings, siteMediaLibrary: newLibrary });
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
    return true;
};

export const saveChatLogSession = async (session: ChatLogSession): Promise<void> => {
    const logs = getLocalStorageItem<ChatLogSession[]>(Constants.CHAT_LOGS_STORAGE_KEY, []);
    const existingIndex = logs.findIndex(log => log.id === session.id);
    if (existingIndex > -1) logs[existingIndex] = session; else logs.unshift(session);
    setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, logs.slice(0, 50));
};
export const getChatLogSessions = async (): Promise<ChatLogSession[]> => getLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, []);
export const deleteChatLogSession = async (id: string): Promise<boolean> => {
    const logs = getLocalStorageItem<ChatLogSession[]>(Constants.CHAT_LOGS_STORAGE_KEY, []);
    setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, logs.filter(log => log.id !== id));
    return true;
};

export const getFinancialTransactions = async (): Promise<FinancialTransaction[]> => getLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, []);
export const addFinancialTransaction = async (transaction: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> => {
    const items = await getFinancialTransactions();
    const newItem = { ...transaction, id: `fin-${Date.now()}` };
    setLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, [newItem, ...items]);
    return newItem;
};
export const updateFinancialTransaction = async (id: string, updates: Partial<FinancialTransaction>): Promise<boolean> => {
    const items = await getFinancialTransactions();
    setLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, items.map(i => i.id === id ? { ...i, ...updates } : i));
    return true;
};
export const deleteFinancialTransaction = async (id: string): Promise<boolean> => {
    const items = await getFinancialTransactions();
    setLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, items.filter(i => i.id !== id));
    return true;
};

export const getPayrollRecords = async (): Promise<PayrollRecord[]> => getLocalStorageItem(Constants.PAYROLL_RECORDS_STORAGE_KEY, []);
export const savePayrollRecords = async (records: PayrollRecord[]): Promise<boolean> => {
    setLocalStorageItem(Constants.PAYROLL_RECORDS_STORAGE_KEY, records);
    return true;
};

export const getQuotations = async (): Promise<Quotation[]> => getLocalStorageItem('siteQuotations_v1', []);
export const addQuotation = async (quote: Omit<Quotation, 'id'>): Promise<Quotation> => {
    const items = await getQuotations();
    const newItem = { ...quote, id: `quote-${Date.now()}` };
    setLocalStorageItem('siteQuotations_v1', [newItem, ...items]);
    return newItem;
};
export const updateQuotation = async (id: string, updates: Partial<Quotation>): Promise<boolean> => {
    const items = await getQuotations();
    setLocalStorageItem('siteQuotations_v1', items.map(i => i.id === id ? { ...i, ...updates } : i));
    return true;
};
export const deleteQuotation = async (id: string): Promise<boolean> => {
    const items = await getQuotations();
    setLocalStorageItem('siteQuotations_v1', items.filter(i => i.id !== id));
    return true;
};
