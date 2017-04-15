create table cms_resources(
    id serial primary key,
    slug text not null,
    mime_type text default 'text/html',
    value text,
    resource_type text, /* page, master, binary, system */
    parent_resource_id integer default null,
    publish_from timestamp DEFAULT now(),
    publish_to timestamp DEFAULT null,
    create_datetime timestamp DEFAULT now(),
    modify_datetime timestamp DEFAULT null,
    delete_datetime timestamp DEFAULT null
);

create table cms_form_items (
    id serial primary key,
    data_type text not null,
    value text default '{}',
    create_datetime timestamp DEFAULT now(),
    modify_datetime timestamp DEFAULT null,
    delete_datetime timestamp DEFAULT null
);