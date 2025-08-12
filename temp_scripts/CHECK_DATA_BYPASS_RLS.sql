-- Lists exact row counts for every public table (ignores RLS)
create temporary table _rowcounts(table_name text, rows bigint);
do $$
declare r record;
begin
  for r in
    select table_schema, table_name
    from information_schema.tables
    where table_schema='public' and table_type='BASE TABLE'
  loop
    execute format(
      'insert into _rowcounts select %L, count(*) from %I.%I',
      r.table_schema||'.'||r.table_name, r.table_schema, r.table_name
    );
  end loop;
end$$;
select * from _rowcounts order by table_name;
