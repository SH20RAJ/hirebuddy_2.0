import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  website?: string;
  linkedin_url?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'bounced' | 'unsubscribed';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching contacts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [data, ...prev]);
      toast({
        title: "Contact added",
        description: "Contact has been successfully added.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding contact",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => prev.map(contact => 
        contact.id === id ? data : contact
      ));
      toast({
        title: "Contact updated",
        description: "Contact has been successfully updated.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating contact",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Contact deleted",
        description: "Contact has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
}; 