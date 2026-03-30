// public/sw.js
// Service Worker للإشعارات الفورية (Push Notifications)

// استماع لحدث التثبيت
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  self.skipWaiting()
})

// استماع لحدث التفعيل
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated')
  event.waitUntil(clients.claim())
})

// استماع لإشعارات Push
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  let data = {}
  
  // جلب البيانات من الإشعار
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: 'تنبيه جديد',
        message: event.data.text()
      }
    }
  }
  
  // إعدادات الإشعار
  const title = data.title || 'متتبع أسعار الذهب والفضة'
  const options = {
    body: data.message || 'لديك تنبيه جديد',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'price-alert',
    requireInteraction: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'فتح'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  }
  
  // عرض الإشعار
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// استماع لضغط المستخدم على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  // إذا ضغط على "فتح"
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data.url || '/'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // إذا كان هناك نافذة مفتوحة، استخدمها
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i]
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }
          
          // وإلا، افتح نافذة جديدة
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})

// استماع لرسائل من الصفحة الرئيسية
self.addEventListener('message', (event) => {
  console.log('Message from main thread:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Fetch event (للتخزين المؤقت في المستقبل)
self.addEventListener('fetch', (event) => {
  // حالياً لا نفعل شيء، لكن يمكن إضافة استراتيجيات تخزين مؤقت هنا
  return
})
