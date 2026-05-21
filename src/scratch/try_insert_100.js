import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function tryInsert() {
  console.log('Attempting to insert a note of 100...');
  
  // We can just try to upsert a fake note or update an existing note to 100
  // Let's select one note first
  const { data: notes } = await supabase.schema('portal_afv').from('notas_por_submodulo').select('*').limit(1);
  if (!notes || notes.length === 0) {
    console.log('No notes found to test with.');
    return;
  }
  
  const sampleNote = notes[0];
  console.log('Testing with note ID:', sampleNote.id);
  
  const { error } = await supabase
    .schema('portal_afv')
    .from('notas_por_submodulo')
    .update({ nota: 100 })
    .eq('id', sampleNote.id);
    
  if (error) {
    console.error('Insert 100 failed with error:', error);
  } else {
    console.log('Success! Database supports 100 as a note!');
    // Revert it back
    await supabase
      .schema('portal_afv')
      .from('notas_por_submodulo')
      .update({ nota: sampleNote.nota })
      .eq('id', sampleNote.id);
  }
}

tryInsert();
