// import DeviceList from '@/components/LiveStream'

const routers = [
  {
    path: '/',
    name: 'LiveStream',
    meta: {
      title: 'IPC直播流'
    },
    component: (resolve) => require(['../components/LiveStream.vue'], resolve)
    //component: DeviceList
  },
  {
    path: '/ptt',
    name: 'PushToTalk',
    meta: {
      title: 'PTT'
    },
    component: (resolve) => require(['../components/PushToTalk.vue'], resolve),
    children: [
      {
        path: '/pttview/:groupId',
        name: 'PushToTalkView',
        meta: {
          title: 'PTT View'
        },
        component: (resolve) => require(['../components/PushToTalkView.vue'], resolve)
      }
    ]
  }/*,
  {
    path: '/pttview/:groupId',
    name: 'PushToTalkView',
    meta: {
      title: 'PTT View'
    },
    component: (resolve) => require(['../components/PushToTalkView.vue'], resolve)
  }*/
];

export default routers;
