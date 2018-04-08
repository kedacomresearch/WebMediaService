/**
 * Created by GanChao on 2017/12/15.
 */

import axios from 'axios'

const state = {
  group: [],
  groupMembers: []
};

const getters = {



};

const mutations = {
  updateGroup(state, payload) {
    console.log('updateGroup');
    state.group.length = 0;
    for(let key in payload.data) {
      console.log(key);
      console.log(payload.data[key]);
      state.group.push(payload.data[key]);
    }
  },
  updateGroupMembers(state, payload) {
    console.log('updateGroupMembers:');
    console.log(payload.data);
    state.groupMembers = payload.data;
  }
};

const actions = {
  /**
   * Create Live Stream
   * new Promise((resolve, reject) => {})
   */
  createLiveStream({commit}, payload) {
    let uri = payload.uri;
    console.log(`createLiveStream uri: ${uri}`);
    let bodyObj = {
      source: {
        type: 'rtsp',
        options: {
          rtsp: {
            url: uri
          }
        }
      }
    };
    return new Promise( (resolve, reject) => {
      axios.post('/wms/webmedia/livestream', bodyObj)
        .then( res => {
          if(res.status === 200) {
            console.log(`createLiveStream streamId: ${res.data.streamId}`);
            resolve(res.data.streamId);
          } else {
            reject(Error(`Create Live Stream Error!\n ${res.message}`));
          }
        })
        .catch( err => {
          reject(err);
        });
    });
  },
  /**
   * Add Live Stream Viewer
   * new Promise((resolve, reject) => {})
   */
  addLiveStreamViewer({commit}, payload) {
    let streamId = payload.streamId;

    console.log(`addLiveStreamViewer streamId: ${streamId}`);
    let bodyObj = {
      type: 'webrtc',
      Id: streamId.toString(),
      video: 'recvonly',
      audio: 'recvonly',
    };
    return new Promise( (resolve, reject) => {
      axios.post('/wms/webmedia/livestream/viewer', bodyObj)
        .then( res => {
          if(res.status === 200) {
            console.log(`addLiveStreamViewer viewerId: ${res.data.viewerId}`);
            console.log(`addLiveStreamViewer signalingBridge: ${res.data.signalingBridge}`);
            resolve({
              viewerId: res.data.viewerId,
              signalingBridge: res.data.signalingBridge
            });
          } else {
            reject(Error(`Add Live Stream Viewer Error!\n ${res.message}`));
          }
        })
        .catch( err => {
          reject(err);
        });
    });
  },
  /**
   * Remove Live Stream Viewer
   * new Promise((resolve, reject) => {})
   */
  removeLiveStreamViewer({commit}, payload) {
    let streamId = payload.streamId,
      viewerId = payload.viewerId;
    console.log(`removeLiveStreamViewer viewerId: ${viewerId}`);
    console.log(`removeLiveStreamViewer streamId: ${streamId}`);

    return new Promise( (resolve, reject) => {
      axios.delete('/wms/webmedia/livestream/viewer', {
        data: {
          viewerId: viewerId.toString(),
          streamId: streamId.toString()
        }
      })
        .then( res => {
          if(res.status === 200) {
            resolve();
          } else {
            reject(Error(`Remove Live Stream Viewer Error!\n ${res.message}`));
          }
        })
        .catch( err => {
          reject(err);
        });
    });
  },

  /**
   * Create Push To Talk Group
   * new Promise((resolve, reject) => {})
   */
  createPttGroup({commit}, payload) {
    let groupName = payload.groupName,
      topic = payload.topic,
      media = payload.media;
    console.log(`createPttGroup groupName: ${groupName}`);
    console.log(`createPttGroup topic: ${topic}`);
    console.log(`createPttGroup media: ${media}`);

    return new Promise( (resolve, reject) => {
      axios.post('/wms/webmedia/ptt/group', {
        groupName: groupName,
        topic: topic,
        media: media
      })
        .then( res => {
          if(res.status === 200) {
            resolve(res.data.groupId);
          } else {
            reject(Error(`Create Ptt Group Error!\n ${res.message}`));
          }
        })
        .catch( err => {
          reject(err);
        });
    });
  },

  /**
   * Get Ptt Group members
   * new Promise((resolve, reject) => {})
   */
  getPttGroupMembers({commit}, payload) {
    let groupId = payload.id;
    console.log(`getPttGroupMembers groupId: ${groupId}`);

    return new Promise( (resolve, reject) => {
      axios.get(`/wms/webmedia/ptt/group/members/${groupId}`)
        .then( res => {
          if(res.status === 200) {
            commit({
              type: 'updateGroupMembers',
              data: res.data
            });
            resolve();
          } else {
            reject(Error(`getPttGroupMembers Error!\n ${res.message}`));
          }
        })
        .catch( err => {
          reject(err);
        });
    });
  },

  /**
   * Get Ptt Groups
   * new Promise((resolve, reject) => {})
   */
  getPttGroups({commit}, payload) {
    return new Promise( (resolve, reject) => {
      axios.get(`/wms/webmedia/ptt/groups`)
        .then( res => {
          if(res.status === 200) {
            console.log('getPttGroups: ');
            console.log(res.data);
            commit({
              type: 'updateGroup',
              data: res.data
            });
            resolve();
          } else {
            reject(Error(`getPttGroups Error!\n ${res.message}`));
          }
        })
        .catch( err => {
          reject(err);
        });
    });
  },

  /**
   * Add Ptt Group member
   * new Promise((resolve, reject) => {})
   */
  addPttGroupMember({commit}, payload) {
    let groupId = payload.groupId,
      memberName = payload.memberName;
    console.log(`addPttGroupMember groupId: ${groupId}`);
    console.log(`addPttGroupMember memberName: ${memberName}`);

    return new Promise( (resolve, reject) => {
      axios.put(`/wms/webmedia/ptt/group/member/${groupId}`, {
        name: memberName
      })
        .then( res => {
          if(res.status === 200) {
            resolve(res.data.member);
          } else {
            reject(Error(`addPttGroupMember Error!\n ${res.message}`));
          }
        })
        .catch( err => {
          reject(err);
        });
    });
  }
};


export default {
  state,
  getters,
  mutations,
  actions
}
