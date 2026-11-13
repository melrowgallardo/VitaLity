import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/deviceId';
import { sortVitamins, parseLocalDate, getLocalTodayStr } from '../lib/dateUtils';

export const api = {
  /**
   * Fetch all vitamins for the current device ordered by date (descending) and time
   */
  async getVitamins() {
    const currentDeviceId = getDeviceId();

    const { data, error } = await supabase
      .from('vitamins')
      .select('*')
      .eq('device_id', currentDeviceId)
      .order('date', { ascending: false })
      .order('time', { ascending: true });

    if (error) {
      throw new Error(error.message || 'Failed to fetch vitamins from Supabase.');
    }

    const formatted = (data || []).map((item) => ({
      ...item,
      time: item.time ? item.time.slice(0, 5) : '',
      full_time: item.time,
    }));

    return sortVitamins(formatted);
  },

  /**
   * Insert one or multiple vitamin records for the current device
   * Supports single record, bulk array, or { name, date, time, duration }
   * @param {{ name: string, date: string, time: string, duration?: number } | Array<{ name: string, date: string, time: string }>} payload
   */
  async addVitamin(payload) {
    const currentDeviceId = getDeviceId();
    let recordsToInsert = [];

    if (Array.isArray(payload)) {
      recordsToInsert = payload.map((item) => ({
        name: item.name,
        date: item.date,
        time: item.time && item.time.length === 5 ? `${item.time}:00` : item.time,
        is_completed: false,
        device_id: currentDeviceId,
      }));
    } else if (payload.records && Array.isArray(payload.records)) {
      recordsToInsert = payload.records.map((item) => ({
        name: item.name,
        date: item.date,
        time: item.time && item.time.length === 5 ? `${item.time}:00` : item.time,
        is_completed: false,
        device_id: currentDeviceId,
      }));
    } else if (payload.duration && payload.duration > 1) {
      const baseDate = parseLocalDate(payload.date);
      for (let i = 0; i < payload.duration; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        recordsToInsert.push({
          name: payload.name,
          date: getLocalTodayStr(d),
          time: payload.time && payload.time.length === 5 ? `${payload.time}:00` : payload.time,
          is_completed: false,
          device_id: currentDeviceId,
        });
      }
    } else {
      const formattedTime = payload.time && payload.time.length === 5 ? `${payload.time}:00` : payload.time;
      recordsToInsert = [
        {
          name: payload.name,
          date: payload.date,
          time: formattedTime,
          is_completed: false,
          device_id: currentDeviceId,
        },
      ];
    }

    const { data, error } = await supabase
      .from('vitamins')
      .insert(recordsToInsert)
      .select();

    if (error) {
      throw new Error(error.message || 'Failed to insert vitamin(s) into Supabase.');
    }

    const formattedList = (data || []).map((item) => ({
      ...item,
      time: item.time ? item.time.slice(0, 5) : '',
      full_time: item.time,
    }));

    return formattedList.length === 1 && !Array.isArray(payload) && (!payload.duration || payload.duration === 1)
      ? formattedList[0]
      : formattedList;
  },

  /**
   * Bulk insert an array of vitamin records at once
   * @param {Array<{ name: string, date: string, time: string }>} records
   */
  async addVitamins(records) {
    return this.addVitamin(records);
  },

  /**
   * Update vitamin details (name, date, time) in Supabase
   * @param {number|string} id
   * @param {{ name?: string, date?: string, time?: string }} updates
   */
  async updateVitamin(id, updates) {
    const formattedUpdates = { ...updates };
    if (formattedUpdates.time && formattedUpdates.time.length === 5) {
      formattedUpdates.time = `${formattedUpdates.time}:00`;
    }

    const { data, error } = await supabase
      .from('vitamins')
      .update(formattedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update vitamin details.');
    }

    return {
      ...data,
      time: data.time ? data.time.slice(0, 5) : '',
      full_time: data.time,
    };
  },

  /**
   * Toggle completion status in Supabase by item ID or vitamin object
   * @param {number|string|object} vitaminOrId
   * @param {boolean} [currentStatus]
   */
  async toggleCompleted(vitaminOrId, currentStatus) {
    let id = vitaminOrId;
    let isCompleted = currentStatus;

    if (typeof vitaminOrId === 'object' && vitaminOrId !== null) {
      id = vitaminOrId.id;
      isCompleted = vitaminOrId.is_completed;
    }

    const nextStatus = !isCompleted;

    const { data, error } = await supabase
      .from('vitamins')
      .update({ is_completed: nextStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update vitamin status.');
    }

    return {
      ...data,
      time: data.time ? data.time.slice(0, 5) : '',
      full_time: data.time,
    };
  },

  /**
   * Delete vitamin entry by item ID in Supabase
   * @param {number|string} id
   */
  async deleteVitamin(id) {
    const { error } = await supabase
      .from('vitamins')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Failed to delete vitamin from Supabase.');
    }

    return { id };
  },

  /**
   * Subscribe to real-time changes for the current device's vitamins
   * @param {function} onChange
   * @returns {{ unsubscribe: function }}
   */
  subscribeToChanges(onChange) {
    const currentDeviceId = getDeviceId();

    const channel = supabase
      .channel(`vitamins-live-${currentDeviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vitamins',
          filter: `device_id=eq.${currentDeviceId}`,
        },
        (payload) => {
          if (onChange) onChange(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};
