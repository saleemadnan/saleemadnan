# إعداد التكامل الكامل مع Meta Graph API v19.0

## الخطوة 1: إنشاء Meta App
1. اذهب إلى: https://developers.facebook.com
2. أنشئ تطبيق جديد من نوع **Business**.
3. أضف المنتجات التالية للتطبيق:
   - Facebook Login
   - Pages API
   - Instagram Graph API
   - Marketing API

## الخطوة 2: الحصول على Page Access Token
1. افتح Graph API Explorer واختر التطبيق والصفحة المرتبطة.
2. اطلب الصلاحيات التالية:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_manage_ads`
   - `ads_management`
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_insights`
   - `pages_messaging`
3. حوّل Short-lived token إلى Long-lived token عبر:

```http
GET /oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={APP_ID}
  &client_secret={APP_SECRET}
  &fb_exchange_token={SHORT_TOKEN}
```

## الخطوة 3: الحصول على Ad Account ID
1. اذهب إلى: `business.facebook.com`.
2. من الإعدادات → حسابات الإعلانات.
3. انسخ ID الحساب الإعلاني وأضف قبله `act_`.

## الخطوة 4: الحصول على Instagram Business Account ID
1. من Graph API Explorer نفّذ:

```http
GET /{page-id}?fields=instagram_business_account
```

2. انسخ قيمة `id` الخاصة بـ Instagram Business Account.

## الخطوة 5: إعداد .env والنشر
1. انسخ ملف `backend/.env.example` إلى `.env`.
2. املأ جميع القيم الحقيقية بدون وضعها في الكود.
3. شغّل الخدمة وتأكد من `/api/health` أن حالة التوكن `connected`.
4. استخدم endpoint `/api/auth/refresh-token` لتجديد Long-lived token بشكل دوري.

> ملاحظة: عند غياب `META_ACCESS_TOKEN` سيعمل المشروع في وضع Mock تلقائيًا بدون طلبات حقيقية إلى Meta API.
