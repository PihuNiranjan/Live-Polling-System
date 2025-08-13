class PollService {
  constructor() {
    this.polls = JSON.parse(localStorage.getItem("polls")) || [];
    this.currentPoll = JSON.parse(localStorage.getItem("currentPoll")) || null;
    this.students = JSON.parse(localStorage.getItem("students")) || [];
    this.votes = JSON.parse(localStorage.getItem("votes")) || {};
  }

  saveToStorage() {
    localStorage.setItem("polls", JSON.stringify(this.polls));
    localStorage.setItem("currentPoll", JSON.stringify(this.currentPoll));
    localStorage.setItem("students", JSON.stringify(this.students));
    localStorage.setItem("votes", JSON.stringify(this.votes));
  }

  createPoll(pollData) {
    this.currentPoll = {
      id: Date.now().toString(),
      ...pollData,
      startTime: new Date(),
      isActive: true,
      options: pollData.options.map((option, index) => ({
        id: index,
        text: option,
        votes: 0,
      })),
    };
    this.votes = {};
    this.saveToStorage();
    return this.currentPoll;
  }

  submitVote(studentId, optionId) {
    if (!this.currentPoll || !this.currentPoll.isActive) return false;
    if (this.votes[studentId]) return false;

    this.votes[studentId] = optionId;
    this.currentPoll.options[optionId].votes += 1;
    this.saveToStorage();
    return true;
  }

  endPoll() {
    if (this.currentPoll) {
      this.currentPoll.isActive = false;
      this.polls.unshift({ ...this.currentPoll });
      this.saveToStorage();
    }
  }

  addStudent(name) {
    const student = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      joinedAt: new Date(),
      hasVoted: false,
    };
    this.students.push(student);
    this.saveToStorage();
    return student;
  }

  removeStudent(studentId) {
    this.students = this.students.filter((student) => student.id !== studentId);
    delete this.votes[studentId];
    this.saveToStorage();
  }

  getCurrentPoll() {
    return this.currentPoll;
  }
  getStudents() {
    return this.students;
  }
  getVotes() {
    return this.votes;
  }
  getPollHistory() {
    return this.polls;
  }
}


const pollServiceInstance = new PollService();
export default pollServiceInstance;
