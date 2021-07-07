<style scoped>
  .layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  }
  .layout-breadcrumb{
    padding: 10px 15px 0;
  }
  .layout-content{
    min-height: 600px;
    margin: 15px;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
  }
  .layout-content-main{
    padding: 10px;
  }
  .layout-copy{
    text-align: center;
    padding: 10px 0 20px;
    color: #9ea7b4;
  }
  .layout-menu-left{
    background: #464c5b;
  }
  .layout-header{
    height: 60px;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,.1);
  }
  .layout-logo-left{
    width: 90%;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    margin: 15px auto;
  }
  .layout-ceiling-main a{
    color: #9ba7b5;
  }
  .layout-hide-text .layout-text{
    display: none;
  }
  .ivu-col{
    transition: width .2s ease-in-out;
  }
</style>
<template>
  <div class="layout" :class="{'layout-hide-text': spanLeft < 5}">
    <Row type="flex">
      <Col :span="spanLeft" class="layout-menu-left">
      <Menu active-name="1" theme="dark" width="auto" :accordion=true v-on:on-select="onSelected">
        <MenuGroup  title="PTT组列表">
          <template v-for="(item, index) in group">
            <MenuItem :name="index">
              {{item.name}}
            </MenuItem>
          </template>
        </MenuGroup >
      </Menu>
      </Col>
      <Col :span="spanRight">
<!--      <div class="layout-header">
        <Button type="text" @click="toggleClick">
          <Icon type="navicon" size="32"></Icon>
        </Button>
      </div>-->
<!--      <div class="layout-breadcrumb">
        <Breadcrumb>
          &lt;!&ndash;<BreadcrumbItem href="/">首页</BreadcrumbItem>&ndash;&gt;
          &lt;!&ndash;<BreadcrumbItem href="/index">应用中心</BreadcrumbItem>&ndash;&gt;
          <BreadcrumbItem>PTT视频会话</BreadcrumbItem>
          &lt;!&ndash;<BreadcrumbItem>{{selectedStream}}</BreadcrumbItem>&ndash;&gt;
        </Breadcrumb>
      </div>-->
      <div class="layout-content">
<!--        <div id = "callPage" class = "call-page">
          <video id = "localVideo" autoplay controls></video>

          <video id = "remoteVideo" autoplay controls></video>

          <div class = "row text-center">
            <br>
            <div id="meters">
              <div id="instant">
                <div class="label">Volume: </div>
                <meter high="0.25" max="1" value="0"></meter>
                <div class="value"></div>
              </div>
            </div>
            <div class = "col-md-12">
              <button id = "callBtn" class = "btn-success btn" @click="">发言</button>
              <button id = "hangUpBtn" class = "btn-danger btn" @click="">下线</button>
            </div>
          </div>

        </div>-->
        <router-view></router-view>
<!--        <div class="layout-content-form">
          <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
            <FormItem label="Group Name" prop="groupName">
              <Input v-model="formValidate.groupName" placeholder="Enter group name"></Input>
            </FormItem>
            <FormItem label="Topic" prop="topic">
              <Input v-model="formValidate.topic" placeholder="Enter topic"></Input>
            </FormItem>
            <FormItem label="Media" prop="media">
              <Select v-model="formValidate.media" placeholder="选择会话媒体类型">
                <Option value="audio">音频</Option>
                <Option value="video">视频</Option>
                <Option value="audiovideo">音视频</Option>
              </Select>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="handleSubmit('formValidate')">Submit</Button>
              <Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">Reset</Button>
            </FormItem>
          </Form>
        </div>-->
<!--        <div class="layout-breadcrumb">
          <Breadcrumb>
            &lt;!&ndash;<BreadcrumbItem href="/">首页</BreadcrumbItem>&ndash;&gt;
            <BreadcrumbItem>PTT组 {{selectedGroupName}} 成员信息</BreadcrumbItem>
          </Breadcrumb>
          <br/>
        </div>-->
        <div class="layout-content-table">
          <!--<Table border :columns="columns7" :data="groupMembers"></Table>-->
<!--          <br>
          <Button type="primary" size="large" @click="joinGroup"><Icon type="person-add"></Icon> Join Group</Button>
          <Modal v-model="modal" width="360" @on-ok="onOk" @on-cancel="onCancel">
            <p slot="header" style="color:green;text-align:center">
              <Icon type="information-circled"></Icon>
              <span>Join Group Confirmation</span>
            </p>
            <div style="text-align:left">
              <span>
                <label>名称：</label>
                <input type="text" name="lname" v-model="memberName" />
              </span>
              <br>
              <br>
              <span>
                <label>终端类型：</label>
                <select v-model="memberType">
                  <option v-for="item in typeOption" :value="item">{{item}}</option>
                </select>
              </span>
            </div>
&lt;!&ndash;            <div slot="footer">
              <Button type="error" size="large" long :loading="modal_loading" @click="del">Delete</Button>
            </div>&ndash;&gt;
          </Modal>-->
        </div>
      </div>
      <div class="layout-copy">
        2011-2017 &copy; Kedacom Sys
      </div>
      </Col>
    </Row>
  </div>
</template>
<script>
  import axios from 'axios'
  import { mapState } from 'vuex'
  import webStreamer from '@/libs/webStreamer/webStreamer'
  import 'webrtc-adapter'
  export default {
    data () {
      return {
        spanLeft:5,
        spanRight: 19,
        selectedGroupName: null,
        selectedGroupId: null,
        selectedGroupMedia: null,
        formValidate: {
          groupName: '',
          topic: '',
          media: ''
        },
        ruleValidate: {
          groupName: [
            { required: true, message: 'The name cannot be empty', trigger: 'blur' }
          ],
          topic: [
            { required: true, message: 'Topic cannot be empty', trigger: 'blur' },
          ],
          media: [
            { required: true, message: 'Please select the media type', trigger: 'change' }
          ]
        },
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
        modal: false,
        memberName: null,
        memberType: null,
        typeOption: ['RTSP', 'webRTC']
      }
    },
    beforeRouteLeave (to, from, next) {
      console.log('beforeRouteLeave');
      next();
    },
    mounted() {

    },
    computed: {
      iconSize () {
        return this.spanLeft === 5 ? 14 : 24;
      },
      ...mapState({
        group: state => state.webMediaService.group,
        groupMembers: state => state.webMediaService.groupMembers
      })
    },
    created() {
      this.$Loading.start();
      this.$store.dispatch({
        type: 'getPttGroups',
      })
        .then( res => {
          this.$Loading.finish();
        })
        .catch( err => {
        console.log(err.message);
        this.$Loading.error();
      });
    },
    methods: {
      //table
      remove (index) {
        this.groupMembers.splice(index, 1);
      },
      // form
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.createPttGroup();
          } else {
            this.$Message.error('Fail!');
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields();
      },
      joinGroup () {
        console.log(`joinGroup, groupId: ${this.selectedGroupId}`);
        if(this.selectedGroupId) {
          this.modal = true;
        } else {
            this.$Modal.info({
              content: '请先选择要加入的PTT组！'
            });
        }

      },
      onOk() {
        this.modal = false;
        console.log(`memberName: ${this.memberName}`);
        console.log(`memberName: ${this.memberType}`);
        this.$router.push({
          path: `/pttview/${this.selectedGroupId}`,
          query: {
            memberName: this.memberName,
            memberType: this.memberType,
            media: this.selectedGroupMedia
          }
        });
        this.memberName = null;
        this.memberType = null;
      },
      onCancel() {
        this.modal = false;
      },
      createPttGroup(name, topic, media) {
        this.$Loading.start();
        this.$store.dispatch({
          type: 'createPttGroup',
          groupName: this.formValidate.groupName || name,
          topic: this.formValidate.topic || topic,
          media: this.formValidate.media || media
        }).then(groupId => {
          this.$Loading.finish();
          this.$Message.success('Success!');
          this.group.push({
            id: groupId,
            name: this.formValidate.groupName || name,
            media: this.formValidate.media || topic,
            topic: this.formValidate.media || media
          });
        }, err => {
          // Error handle
          console.log(err.message);
          this.$Loading.error();
        })
      },
      onSelected (index) {
        if(!this.group) {
            return;
        }
        console.log(`selected groupId: ${this.group[index].id}`);
        if(this.selectedGroupName === this.group[index].name) {
          return;
        }
        setInterval(() => {
          this.getPttGroupMembers(this.group[index].id);
        }, 5000);

        this.selectedGroupName = this.group[index].name;
        this.selectedGroupId = this.group[index].id;
        this.selectedGroupMedia = this.group[index].media;
        this.$router.push({
          path: `/pttview/${this.selectedGroupId}`,
          query: {
            memberName: `member${Math.floor(Math.random()*1000)}`,
            memberType: 'webRTC',
            media: this.selectedGroupMedia
          }
        });
      },
      toggleClick () {
        if (this.spanLeft === 5) {
          this.spanLeft = 2;
          this.spanRight = 22;
        } else {
          this.spanLeft = 5;
          this.spanRight = 19;
        }
      },
      getRegisteredDeviceList () {
        this.$Loading.start();
        this.$store.dispatch({
          type: 'getDeviceList'
        }).then(res => {
          this.$Loading.finish();
        }, err => {
          // Error handle
          console.log(err.message);
          this.$Loading.error();
        })
      },
      getStreamConfig (ip) {
        this.$Loading.start();
        this.$store.dispatch({
          type: 'getStreamConfig',
          ip: ip
        }).then(res => {
          this.$Loading.finish();
        }, err => {
          // Error handle
          console.log(err.message);
          this.$Loading.error();
        })
      },
      getPttGroupMembers (groupId) {
        this.$store.dispatch({
          type: 'getPttGroupMembers',
          id: groupId
        }).then(res => {
        }, err => {
          // Error handle
          console.log(err.message);
        })
      }
    }
  }
</script>
