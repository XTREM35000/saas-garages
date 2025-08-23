-- Migration pour corriger les contraintes de workflow_states
-- Date: 2025-01-27

-- Ajouter une contrainte unique sur user_id
ALTER TABLE public.workflow_states
ADD CONSTRAINT workflow_states_user_id_unique UNIQUE (user_id);

-- Vérifier que la contrainte a été ajoutée
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'workflow_states'
    AND tc.constraint_type = 'UNIQUE';
