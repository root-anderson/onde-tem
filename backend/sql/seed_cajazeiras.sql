INSERT INTO estabelecimentos (nome, descricao, categoria, localizacao) VALUES
('Farmácia Central', 'Farmácia no centro', 'Farmácia',
    ST_SetSRID(ST_MakePoint(-38.5614, -6.8902), 4326)::geography),
('Mercadinho Bom Preço', 'Compras do dia a dia', 'Mercadinho',
    ST_SetSRID(ST_MakePoint(-38.5580, -6.8880), 4326)::geography),
('Restaurante Sabor da Terra', 'Comida regional', 'Restaurante',
    ST_SetSRID(ST_MakePoint(-38.5650, -6.8925), 4326)::geography),
('Posto Boa Viagem', 'Combustível 24h', 'Posto de combustível',
    ST_SetSRID(ST_MakePoint(-38.5500, -6.8850), 4326)::geography),
('Praça da Matriz', 'Praça com área de lazer', 'Praça',
    ST_SetSRID(ST_MakePoint(-38.5605, -6.8895), 4326)::geography);