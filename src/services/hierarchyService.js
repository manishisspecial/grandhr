import { supabase } from '../lib/supabase';

/**
 * Save hierarchy data to Supabase
 */
export const saveHierarchyToSupabase = async (hierarchy, employees) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Convert Map to array for storage
    const employeesArray = Array.from(employees.entries());

    const hierarchyData = {
      hierarchy,
      employees: employeesArray,
      updated_at: new Date().toISOString(),
    };

    // Upsert (insert or update) the hierarchy for this user
    const { data, error } = await supabase
      .from('hierarchies')
      .upsert({
        user_id: user.id,
        data: hierarchyData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }

    console.log('Hierarchy saved to Supabase successfully');
    return data;
  } catch (error) {
    console.error('Failed to save to Supabase:', error);
    throw error;
  }
};

/**
 * Load hierarchy data from Supabase
 */
export const loadHierarchyFromSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('hierarchies')
      .select('data')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found for this user
        console.log('No hierarchy data found in Supabase');
        return null;
      }
      console.error('Error loading from Supabase:', error);
      throw error;
    }

    if (data && data.data) {
      // Convert employees array back to Map
      const employeesMap = new Map(data.data.employees || []);
      return {
        hierarchy: data.data.hierarchy,
        employees: employeesMap,
      };
    }

    // Fallback: if data structure is different
    if (data) {
      const hierarchyData = data.data || data;
      if (hierarchyData.hierarchy) {
        const employeesMap = new Map(hierarchyData.employees || []);
        return {
          hierarchy: hierarchyData.hierarchy,
          employees: employeesMap,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to load from Supabase:', error);
    return null;
  }
};

/**
 * Delete hierarchy data from Supabase
 */
export const deleteHierarchyFromSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('hierarchies')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting from Supabase:', error);
      throw error;
    }

    console.log('Hierarchy deleted from Supabase successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete from Supabase:', error);
    throw error;
  }
};

