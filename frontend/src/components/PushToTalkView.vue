<template>
    <div id = "callPage" class = "call-page">
        <h1>PTT多点视频会话</h1>
        <video id = "localVideo" autoplay controls></video>

        <video id = "remoteVideo" autoplay controls></video>

        <div class = "row text-center">
<!--            <select v-model="type">
                <option v-for="type in endpointTypes">{{type}}</option>
            </select>
            <button id = "subscribeBtn" class = "btn-success btn" @click="subscribe">Subscribe</button>
            <br>-->
            <br>
          <div id="meters">
            <div id="instant">
              <div class="label">Volume: </div>
              <meter high="0.25" max="1" value="0"></meter>
              <div class="value"></div>
            </div>
          </div>
            <div class = "col-md-12">
                <button id = "callBtn" class = "btn-success btn" @click="becomeSpeaker">发言</button>
                <button id = "hangUpBtn" class = "btn-danger btn" @click="">退出</button>
            </div>
        </div>
      <div class="layout-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>成员信息</BreadcrumbItem>
        </Breadcrumb>
        <br/>
      </div>
      <div class="layout-content-table">
        <Table border :columns="columns7" :data="groupMembers"></Table>
      </div>
    </div>
</template>

<script>
    import webStreamer from '@/libs/webStreamer/webStreamer'
    import axios from 'axios'
    import trace from '@/libs/logging'
    import 'webrtc-adapter'
    import SoundMeter from '@/libs/soundmeter'
    import { mapState } from 'vuex'
    export default {
        name: 'meeting-view',
        data() {
            return {
                connectionId: 0,
                peer_connection: null,
                endpoint: null,
                localStream: null,
                localVideo: null,
                remoteVideo: null,
                signalingBridge: null,
                endpointTypes: ['offerer','answerer'],
                type: 'offerer',
                endpoint_id: null,
                callBtn: null,
                subscribeBtn: null,
                webStreamerClient: null,
                query: null,
              instantMeter: null,
              soundMeter: null,
              columns7: [
                {
                  title: '名称',
                  key: 'name',
                  render: (h, params) => {
                    return h('div', [
                      h('Icon', {
                        props: {
                          type: 'person'
                        }
                      }),
                      h('strong', params.row.name)
                    ]);
                  }
                },
                {
                  title: '终端类型',
                  key: 'type'
                },
                {
                  title: '是否为发言人',
                  key: 'speaker'
                }/*,
                 {
                 title: '操作',
                 key: 'action',
                 width: 150,
                 align: 'center',
                 render: (h, params) => {
                 return h('div', [
                 h('Button', {
                 props: {
                 type: 'error',
                 size: 'small'
                 },
                 on: {
                 click: () => {
                 this.remove(params.index)
                 }
                 }
                 }, 'Delete')
                 ]);
                 }
                 }*/
              ],
            }
        },
        beforeRouteLeave (to, from, next) {
/*            trace('beforeRouteLeave', 'PTTView');
            trace(from, 'from');
            trace(to, 'to');*/

            //this.handUp(next);
            //next();
        },
      beforeRouteUpdate (to, from, next) {
        // 在当前路由改变，但是该组件被复用时调用
        // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
        // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
        // 可以访问组件实例 `this`
        if(from) {
            this.handUp()
              .then(()=>{
                this.createEndpoint(to.params.groupId, to.query);
                next();
              })
              .catch(err => {
                  console.log(err);
              })
        } else {
          this.createEndpoint(to.params.groupId, to.query);
          next();
        }
      },
        mounted() {
            this.callBtn = document.getElementById('callBtn');
            this.subscribeBtn = document.getElementById('subscribeBtn');
            this.localVideo = document.getElementById('localVideo');
            this.remoteVideo = document.getElementById('remoteVideo');
            this.localVideo.addEventListener('loadedmetadata', function() {
                trace('Local video videoWidth: ' + this.videoWidth +
                    'px,  videoHeight: ' + this.videoHeight + 'px');
            });
            this.remoteVideo.addEventListener('loadedmetadata', function() {
                trace('Remote video videoWidth: ' + this.videoWidth +
                    'px,  videoHeight: ' + this.videoHeight + 'px');
            });

          this.instantMeter = document.querySelector('#instant meter');

          try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioContext = new AudioContext();
          } catch (e) {
            alert('Web Audio API not supported.');
          }
        },
        created() {

/*            this.groupId = this.$route.params.groupId;
            trace(this.groupId, 'multi ptt groupId');
            this.query = this.$route.query;
            trace(this.query, 'multi ptt query');*/

            this.createEndpoint(this.$route.params.groupId, this.$route.query);
        },
      computed: {
        ...mapState({
          groupMembers: state => state.webMediaService.groupMembers
        })
      },
        methods: {
            createEndpoint(groupId, query) {
                console.log('\n\n=============createEndpoint==============\n\n');
              this.endpoint_id = Math.floor(Math.random()*10000);
              this.groupId = groupId;
              this.query = query;
                axios.post(`/wms/webmedia/ptt/group/endpoint`, {
                    groupId: this.groupId,
                    endpoint: [{
                        name: this.query.memberName,
                        type: this.query.memberType,
                        options: {
                            webrtc: {
                                audio: "sendrecv",
                                video: "sendrecv"
                            }
                        }
                    }]
                })
                    .then( response => {
                        trace(response);
                        let endpoint = response.data.endpoint;

                        this.connectionId = endpoint[0].Id;
                        trace('connectionId:' + this.connectionId);
                        this.signalingBridge = response.data.signalingBridge;
                        trace('signalBridge:' + this.signalingBridge);
                        this.createClientServer();
                      this.getPttGroupMembers(this.groupId);

                    })
                    .catch( error => {
                        console.log(error);
                    });
            },
            request(msgObj, method, path) {
                if(this.webStreamerClient) {
                  this.webStreamerClient.request({
                    method: method,
                    path: path,
                    body: JSON.stringify(msgObj)
                  });
                }
            },
            createClientServer() {
                let self = this;

              this.webStreamerClient = webStreamer.createClientServer( reqRes => {
//                trace('createClientServer:');
//                trace(reqRes);
                if(reqRes.header.request) {
                  self.notificationHandler(reqRes.body);
                }
              }).connect(`${this.signalingBridge}/endpoint${this.endpoint_id}`).on('onconnect', () => {
                trace('signalingBridge connected!' + this.signalingBridge + ',' + this.endpoint_id);
                this.handleJoin();
              });

            },
            subscribe() {
                let postObj = {
                    endpoint: [{
                        type: 'answerer',
                        connection: this.connectionId.toString(),
                        group: this.groupId.toString(),
                        topic: ['sdp', 'status']
                    }],
                    notify_addr: `endpoint${this.endpoint_id}`
                };
                let self = this;

                this.request(postObj, 'POST', '/webrtc/subscription');

              let msgObj = {
                endpoint: {
                  type: self.type,
                  connection: self.connectionId.toString(),
                  group: self.groupId.toString()
                },
                message: {
                  status: 'connecting'
                }
              };
              self.request(msgObj, 'PUT', '/webrtc/push');
            },
            notificationHandler(msg) {
                console.log('notificationHandler:\r\n' + msg);
                let data;
                try {
                    data = JSON.parse(msg);
                } catch(err) {
                    console.log(err.message);
                    throw err;
                }
                if(data.message.status === 'connecting') {
                    trace('connecting');
                    if(this.peer_connection) {
                        this.createOffer();
                    }
                    //this.callBtn.disabled = false;
                }
                if(data.message.sdp !== undefined) {
                    switch(data.message.sdp.type) {
                        case "offer":
                            this.handleOffer(data.message.sdp);
                            break;
                        case "answer":
                            this.handleAnswer(data.message.sdp);
                            break;
                        case "leave":
                            this.handleLeave();
                            break;
                        default:
                            break;
                    }
                    if(data.message.sdp.candidate) {
                        this.handleCandidate(data.message.sdp);
                    }
                }
            },
            handleJoin() {
              //getting local video stream
              let self = this;
              let mediaObj = null;
              switch (this.query.media) {
                case 'video':
                  mediaObj = {
                    video: true,
                    audio: false
                  };
                  break;
                case 'audio':
                  mediaObj = {
                    video: false,
                    audio: true
                  };
                  break;
                case 'audiovideo':
                  mediaObj = {
                    video: true,
                    audio: true
                  };
                  break;
                default:
                  mediaObj = {
                    video: true,
                    audio: false
                  };
                  break;
              }

              console.log('mediaObj：');
              console.log(mediaObj);

                navigator.mediaDevices.getUserMedia(mediaObj).then(mediaHandler.bind(self)).catch(errorHandler);

                function mediaHandler(myStream) {
                    trace('Received local stream');
                    //displaying local video stream on the page
                    this.localVideo.srcObject = myStream;
                    this.localStream = myStream;

                    let self = this;

                    if(this.query.media.toLowerCase() !== 'video') {
                      this.soundMeter = window.soundMeter = new SoundMeter(window.audioContext);

                      this.soundMeter.connectToSource(myStream, function(e) {
                        if (e) {
                          alert(e);
                        } else {
                          setInterval(() => {
                            self.instantMeter.value = self.soundMeter.instant.toFixed(2);
                          }, 200);
                        }
                      });
                    }

                    this.peer_connection = new RTCPeerConnection();

                    //setup stream listening
//                    this.peer_connection.addStream(myStream);

                    /*                    let tracksNum = this.localStream.getTracks().length;
                                        trace('trackNum: ' + tracksNum);
                                        for(let i = 0; i < tracksNum; ++i) {
                                            this.peer_connection.addTrack( this.localStream.getTracks()[i], this.localStream);
                                        }*/
                    this.localStream.getTracks().forEach(
                        function(track) {
                            self.peer_connection.addTrack(
                                track,
                                self.localStream
                            );
                        });




                    //when a remote user adds a stream to the peer connection, we display it
                    /*                    this.peer_connection.onaddstream = (e) => {
                                            document.querySelector('#remoteVideo').src = window.URL.createObjectURL(e.stream);
                                        };*/
                    this.peer_connection.ontrack = (e) => {
                        trace('on track');
                        trace(e);
                        if (self.remoteVideo.srcObject !== e.streams[0]) {
                            self.remoteVideo.srcObject = e.streams[0];
                            trace('received remote stream');
                        }
                    };

                    // Setup ice handling
                    this.peer_connection.onicecandidate = function (event) {
                        if (event.candidate) {
                            let msgObj = {
                                endpoint: {
                                    type: self.type,
                                    connection: self.connectionId.toString(),
                                    group: self.groupId.toString()
                                },
                                message: {
                                    sdp: event.candidate
                                }
                            };
                            trace('===========send candidate===========');
                            self.request(msgObj, 'PUT', '/webrtc/push');
                        }

                    };

                    this.peer_connection.oniceconnectionstatechange = function (event) {
                        if(this.peer_connection) {
                            trace('ICE state: ' + this.peer_connection.iceConnectionState);
                            console.log('ICE state change event: ', event);
                        }
                    }.bind(this);
                    this.subscribe();
                }
                function errorHandler(err) {
                    trace(err);
                }
            },
            handleOffer(offer) {
                trace('handleOffer:');
                let self = this;
                trace('setRemoteDescription start');
                self.peer_connection.setRemoteDescription(offer).then(
                    () => {
                        trace('setRemoteDescription complete');
                        trace('createAnswer start');
                        self.peer_connection.createAnswer().then(
                            onCreateAnswerSuccess,
                            () => {
                                trace('Failed to create session description: ' + error.toString());
                            }
                        );
                    },
                    error => {
                        trace('Failed to set session description: ' + error.toString());
                    }
                );

                function onCreateAnswerSuccess(answer) {
                    self.peer_connection.setLocalDescription(answer);
                    trace('answer sdp: ' + answer.sdp);
                    let msgObj = {
                            endpoint: {
                                type: self.type,
                                connection: self.connectionId.toString(),
                                group: self.groupId.toString()
                            },
                            message: {
                                sdp: answer,
                                status: 'connected'
                            }
                        };
                    self.request(msgObj, 'PUT', '/webrtc/push');
                }
            },
            //when we got an answer from a remote user
            handleAnswer(answer) {
                trace('handleAnswer:');
                this.peer_connection.setRemoteDescription(answer);

                let msgObj = {
                    endpoint: {
                        type: this.type,
                        connection: this.connectionId.toString(),
                        group: this.groupId.toString()
                    },
                    message: {
                        status: 'connected'
                    }
                };
                this.request(msgObj, 'PUT', '/webrtc/push');
            },
            //when we got an ice candidate from a remote user
            handleCandidate(candidate) {
                trace('handleCandidate:');
                this.peer_connection.addIceCandidate(candidate).catch(e => trace(e));
            },
            createOffer() {
                let offerOptions = null;

              switch (this.query.media) {
                case 'video':
                  offerOptions = {
                    offerToReceiveAudio: 0,
                    offerToReceiveVideo: 1
                  };
                  break;
                case 'audio':
                  offerOptions = {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 0
                  };
                  break;
                case 'audiovideo':
                  offerOptions = {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 1
                  };
                  break;
                default:
                  offerOptions = {
                    offerToReceiveAudio: 0,
                    offerToReceiveVideo: 1
                  };
                  break;
              }
              console.log('offerOptions：');
              console.log(offerOptions);

                let self = this;

                trace('createOffer start');
                self.peer_connection.createOffer(
                    offerOptions
                ).then(
                    onCreateOfferSuccess,
                    error => {
                        trace('Failed to create session description: ' + error.toString());
                    }
                );

                function onCreateOfferSuccess(desc) {
                    trace('setLocalDescription start');

                    self.peer_connection.setLocalDescription(desc).then(
                        function() {
                            trace('setLocalDescription complete\n');
                            trace('offer sdp: ' + desc.sdp);

                            let msgObj = {
                                endpoint: {
                                    type: self.type,
                                    connection: self.connectionId.toString(),
                                    group: self.groupId.toString()
                                },
                                message: {
                                    sdp: desc
                                }
                            };
                            self.request(msgObj, 'PUT', '/webrtc/push');
                        },
                        error => {
                            trace('Failed to set session description: ' + error.toString());
                        }
                    );
                }
            },
            handUp() {
                return new Promise( (resolve, reject) => {
                    let postObj = {
                      endpoint: [{
                        type: this.type,
                        connection: this.connectionId.toString(),
                        group: this.groupId.toString(),
                        topic: ['sdp', 'status']
                      }],
                      notify_addr: `endpoint${this.endpoint_id}`
                  };

                  this.request(postObj, 'DELETE', '/webrtc/subscription');

                  if(this.peer_connection) {
                    console.log('\n\n===============peer connection close!=====================\n\n');
                    this.peer_connection.close();
                    this.peer_connection = null;
                  }
                  if(this.webStreamerClient) {
                    console.log('\n\n===============webStreamerClient close!=====================\n\n');
                    this.webStreamerClient.close();
                    this.webStreamerClient = null;
                  }
                  if(this.soundMeter) {
                    this.soundMeter.stop();
                  }
                  document.querySelector('#remoteVideo').src = null;
                  document.querySelector('#localVideo').src = null;

                  let endpoint = [];
                  endpoint.push(this.connectionId.toString());
                  axios.delete(`/wms/webmedia/ptt/group/endpoint`, {
                    data: {
                      groupId: this.groupId.toString(),
                      endpointId: endpoint
                    }
                  })
                    .then( () => {
                        resolve();
                    })
                    .catch(err => {
                      console.log(err.message);
                      reject();
                    });
                });
            },
            becomeSpeaker () {
                trace('becomeSpeaker');
                axios.post(`/webmedia/ptt/endpoint/speaker`, {
                    endpointId: this.connectionId,
                    groupId: this.groupId,
                })
                    .then( response => {
                        trace(response, 'becomeSpeaker ok');
                    })
                    .catch( error => {
                        console.log(error);
                    });
            },
          getPttGroupMembers (groupId) {
            this.$Loading.start();
            this.$store.dispatch({
              type: 'getPttGroupMembers',
              id: groupId
            }).then(res => {
              this.$Loading.finish();
            }, err => {
              // Error handle
              console.log(err.message);
              this.$Loading.error();
            })
          }
        }
    }
</script>

<style scoped>
    body {
        background: #eee;
        padding: 5% 0;
    }

    .call-page {
        position: relative;
        display: block;
        margin: 0 auto;
        width: 800px;
        height: 480px;
    }

    video {
        margin: 0 0 20px 0;
        width: calc(50% - 12px);
        background: black;
        border: 1px solid gray;
        float : left;
    }
    video#localVideo {
        margin: 0 20px 20px 0;
    }

    @media screen and (min-width: 730px) {
        video {
            height: 231px;
            width: calc(50% - 12px);
        }
    }

    .btn-success {
        color: #fff;
        background-color: #5cb85c;
        border-color: #4cae4c;
    }
    .btn-success:focus,
    .btn-success.focus {
        color: #fff;
        background-color: #449d44;
        border-color: #255625;
    }
    .btn-success:hover {
        color: #fff;
        background-color: #449d44;
        border-color: #398439;
    }

    .btn-danger {
        color: #fff;
        background-color: #d9534f;
        border-color: #d43f3a;
    }
    .btn-danger:focus,
    .btn-danger.focus {
        color: #fff;
        background-color: #c9302c;
        border-color: #761c19;
    }
    .btn-danger:hover {
        color: #fff;
        background-color: #c9302c;
        border-color: #ac2925;
    }
    h1 {
        border-bottom: 1px solid #ccc;
        font-family: 'Roboto', sans-serif;
        font-weight: 500;
        margin: 0 0 0.8em 0;
        padding: 0 0 0.2em 0;
    }
    div#meters > div {
      margin: 0 0 1em 0;
    }

    div#meters div.label {
      display: inline-block;
      font-weight: 400;
      margin: 0 0.5em 0 0;
      width: 3.5em;
    }

    div#meters div.value {
      display: inline-block;
    }

    meter {
      width: 50%;
    }

    meter#clip {
      color: #db4437;
    }

    meter#slow {
      color: #f4b400;
    }

    meter#instant {
      color: #0f9d58;
    }

</style>
