import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/deviceId';

export const api = {
  /**
   * Fetch all vitamins for the current device ordered by date and time
   */
  async getVitamins() {
    const currentDeviceId = getDeviceId();

    const { data, error } = await supabase
      .from('vitamins')
      .select('*')
      .eq('device_id', currentDeviceId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      throw new Error(error.message || 'Failed to fetch vitamins from Supabase.');
    }

    return (data || []).map((item) => ({
      ...item,
      time: item.time ? item.time.slice(0, 5) : '',
      full_time: item.time,
    }));
  },

  /**
   * Insert new vitamin record for the current device
   * @param {{ name: string, date: string, time: string }} payload
   */
  async addVitamin({ name, date, time }) {
    const currentDeviceId = getDeviceId();
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    const record = {
      name,
      date,
      time: formattedTime,
      is_completed: false,
      device_id: currentDeviceId,
    };

    const { data, error } = await supabase
      .from('vitamins')
      .insert([record])
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to insert vitamin into Supabase.');
    }

    return {
      ...data,
      time: data.time ? data.time.slice(0, 5) : '',
      full_time: data.time,
    };
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
