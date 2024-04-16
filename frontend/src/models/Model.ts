export const model = {
  selectedRole: null as string | null,
  openRoleModal: true as boolean,

  easyMode: false as boolean,
  radioGain: 100 as number,
  PTTKey: "Space" as string,

  setPTTKey: function (key: string) {
    this.PTTKey = key;
  },

  setEasyMode: function (isEasy: boolean) {
    this.easyMode = isEasy;
  },

  setOpenRoleModal(isOpen: boolean) {
    this.openRoleModal = isOpen;
  },

  setSelectedRole: function (role: string) {
    this.selectedRole = role;
  },
};
