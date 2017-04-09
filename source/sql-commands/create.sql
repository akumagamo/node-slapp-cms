
create table cms_resources(
    id serial primary key,
    slug text not null,
    mime_type text default 'text/html',
    value text,
    page_type text,
    uses_masterpage boolean default false,
    uses_default boolean default true
);

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
    modify_datetime timestamp DEFAULT now(),
    delete_datetime timestamp DEFAULT now()
);

/* DEFAULT WEBPAGE */

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_masterpage', 'text/html', '{title}<br />{value}', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_error_not_found', 'text/html', 'NOT FOUND', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_login', 'text/html', 'LOGIN', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_error', 'text/html', 'ERROR', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_upload', 'text/html', 'UPLOAD', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_edit', 'text/html', 'EDIT', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_addin_page_is_loaded', 'text/html', 'EDIT', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('_addin_backend_buttons', 'text/html', 'EDIT', 'systempage', null);

insert into cms_resources(slug, mime_type, value, resource_type, parent_resource_id) 
    values ('/', 'text/html', 'Hello World', 'system', null);


/* ... */


/* HTML */

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_backend_addin', 'text/html', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_login_form', 'text/html', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_edit_form', 'text/html', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_session_addin', 'text/html', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_upload_form', 'text/html', '', 'system', null);

/* Extras */

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_backend_scripts', 'text/javascript', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_backend_styles', 'text/css', '', 'system', null);

/* Backend Images */
insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_image_open', 'image/svg+xml', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_image_settings', 'image/svg+xml', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_image_upload', 'image/svg+xml', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_image_edit', 'image/svg+xml', '', 'system', null);

insert into cms_resources(slug, mime_type, value, value, resource_type, parent_resource_id) 
    values ('default_image_close', 'image/svg+xml', '', 'system', null);