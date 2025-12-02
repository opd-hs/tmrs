import { createClient } from '@/utils/supabase/client';

// Temperature Monitoring API using Supabase
export interface FridgeSection {
    id: string;
    name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    fridges?: Fridge[];
    pic_contacts?: PICContact[];
}

export interface Fridge {
    id: string;
    section_id: string;
    name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    section?: FridgeSection;
}

export interface PICContact {
    id: string;
    section_id: string;
    name: string;
    phone_number: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    section?: FridgeSection;
}

export interface TemperatureReportEntry {
    id: string;
    report_id: string;
    fridge_id: string;
    temperature_in_range: boolean;
    created_at: string;
    fridge?: Fridge;
}

export interface TemperatureReport {
    id: string;
    date: string;
    time: string;
    submitter_name: string;
    remarks?: string | null;
    submitted_by: string;
    created_at: string;
    entries?: TemperatureReportEntry[];
}

export const temperatureApi = {
    // Fridge Sections
    async getFridgeSections(): Promise<FridgeSection[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('fridge_sections')
            .select('*, fridges(*), pic_contacts(*)')
            .order('sort_order');
        if (error) throw new Error(error.message);
        return data || [];
    },

    async createFridgeSection(section: { name: string; sort_order?: number }): Promise<FridgeSection> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('fridge_sections')
            .insert(section)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async updateFridgeSection(id: string, updates: { name?: string; sort_order?: number }): Promise<FridgeSection> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('fridge_sections')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async deleteFridgeSection(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('fridge_sections')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // Fridges
    async createFridge(fridge: { section_id: string; name: string; sort_order?: number }): Promise<Fridge> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('fridges')
            .insert(fridge)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async updateFridge(id: string, updates: { name?: string; sort_order?: number }): Promise<Fridge> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('fridges')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async deleteFridge(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('fridges')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // PIC Contacts
    async createPICContact(contact: { section_id: string; name: string; phone_number: string; sort_order?: number }): Promise<PICContact> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('pic_contacts')
            .insert(contact)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async updatePICContact(id: string, updates: { name?: string; phone_number?: string; sort_order?: number }): Promise<PICContact> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('pic_contacts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async deletePICContact(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('pic_contacts')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // Temperature Reports
    async getTemperatureReports(params?: { date?: string; startDate?: string; endDate?: string }): Promise<TemperatureReport[]> {
        const supabase = createClient();
        let query = supabase
            .from('temperature_reports')
            .select('*, entries:temperature_report_entries(*, fridge:fridges(*, section:fridge_sections(*)))')
            .order('created_at', { ascending: false });

        if (params?.date) {
            query = query.eq('date', params.date);
        }
        if (params?.startDate && params?.endDate) {
            query = query.gte('date', params.startDate).lte('date', params.endDate);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data || [];
    },

    async createTemperatureReport(report: {
        date: string;
        time: string;
        submitter_name: string;
        remarks?: string;
        entries: { fridgeId: string; temperatureInRange: boolean }[];
    }): Promise<TemperatureReport> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Insert report
        const { data: reportData, error: reportError } = await supabase
            .from('temperature_reports')
            .insert({
                date: report.date,
                time: report.time,
                submitter_name: report.submitter_name,
                remarks: report.remarks,
                submitted_by: user.id,
            })
            .select()
            .single();

        if (reportError) throw new Error(reportError.message);

        // Insert entries
        const entries = report.entries.map(entry => ({
            report_id: reportData.id,
            fridge_id: entry.fridgeId,
            temperature_in_range: entry.temperatureInRange,
        }));

        const { error: entriesError } = await supabase
            .from('temperature_report_entries')
            .insert(entries);

        if (entriesError) throw new Error(entriesError.message);

        return reportData;
    },

    async deleteTemperatureReport(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('temperature_reports')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },
};
