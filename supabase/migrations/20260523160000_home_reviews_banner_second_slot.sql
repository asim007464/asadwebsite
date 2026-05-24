-- Second homepage promo banner (before testimonials). id=1 stays after hero carousel.
alter table public.home_reviews_banner drop constraint if exists home_reviews_banner_id_check;
alter table public.home_reviews_banner add constraint home_reviews_banner_id_check check (id in (1, 2));

insert into public.home_reviews_banner (id, background_image_url, heading, paragraph, button_label, button_href, is_active)
values (2, '', '', '', 'Browse products', '/products', false)
on conflict (id) do nothing;
