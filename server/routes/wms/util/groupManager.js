const idGenerator = require('./id_generator');

class Group {
    constructor(id, name, media, topic) {
        this.name = name || '';
        this.groupId = id || '';
        this.media = media || '';
        this.topic = topic || '';
        this.members = Object.create(null);
    }

    addMember(name, type, speaker) {
        if(this.members[name]) {
            return false;
        } else {
            this.members[name] = {
                name: name,
                type: type,
                speaker: speaker
            }
            return true;
        }
    }

    deleteMember(name) {
        if(this.members[name]) {
            delete this.members[name];
        }
    }

    getMember(name) {
        if(this.members[name]) {
            return this.members[name];
        }
        return null;
    }

    getMembers() {
        return this.members;
    }

    get Name() {
        return this.name;
    }

    get Media() {
        return this.media;
    }

}

class GroupManager {
    constructor() {
        this.groups = Object.create(null);
    }

    createGroup(groupId, name, media, topic) {
        if(this.groups[groupId]) {
            return false;
        }
        this.groups[groupId] = new Group(groupId, name, media, topic);
        return true;
    }

    deleteGroup(groupId) {
        let member = this.groups[groupId];
       return delete this.groups[groupId];
    }

    getGroup(groupId) {
        return this.groups[groupId];
    }

    getGroups() {
        let data = [];
        for(let groupId in this.groups) {
            data.push({
                id: groupId,
                name: this.groups[groupId].Name,
                media: this.groups[groupId].Media
            })
        }
        return data;
    }
}

var groupManager = new GroupManager();

module.exports = groupManager;
