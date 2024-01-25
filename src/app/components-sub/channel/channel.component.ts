import { Component, ElementRef } from '@angular/core';
// import { Channel } from 'src/app/interfaces/channel';
import { Channel } from 'src/app/models/channel';
import { User } from 'src/app/models/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { ClickOutsideService } from 'src/app/shared/services/click-outside-directive.service';
import { ResponsiveService } from 'src/app/shared/services/responsive.service';
import { SearchInputService } from 'src/app/shared/services/search-input.service';
import { UserService } from 'src/app/shared/services/user.service';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent {
  clickedChannelId!: string;
  clickedChannel!: Channel;
  additionalMembers: User[] = [];
  previousAdded: boolean = false;

  infoVisible: boolean = false;
  editNameButton: boolean = true;
  editDescriptionButton: boolean = true;

  constructor(
    public ws: WorkspaceService,
    public cs: ChannelService,
    public sis: SearchInputService,
    public us: UserService,
    public rs: ResponsiveService,
    public cos: ClickOutsideService, private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.cs.clickedChannelId.subscribe((chId: string) => {
      this.clickedChannelId = chId;
    });

    this.cs.clickedChannel.subscribe((ch: Channel) => {
      this.clickedChannel = ch;
    });

    this.cos.onClickOutside(this.elementRef, () => {debugger; this.ws.closeAddMembers();});
  }

  showInfo() {
    this.infoVisible = !this.infoVisible;
    this.editNameButton = true;
    this.editDescriptionButton = true;
  }

  switchShowAddMembersInExistingChannel() {
    this.ws.showAddMembersInExistingChannel =
      !this.ws.showAddMembersInExistingChannel;
    // Dropdown-Liste soll immer geschlossen werden, wenn Leute hinzufügen Fenster geschlossen wird
    if (!this.ws.showAddMembersInExistingChannel) {
      this.ws.showAddMembers = false;
    }
  }

  changeNameToInput() {
    this.editNameButton = !this.editNameButton;
  }

  changeDescriptionToInput() {
    this.editDescriptionButton = !this.editDescriptionButton;
  }

  removeMember(email: string) {
    const members = this.additionalMembers;
    if (members) {
      for (let index = 0; index < members.length; index++) {
        const member = members[index];
        if (member.email == email) {
          members.splice(index, 1);
        }
      }
    }
    this.additionalMembers = [];
    this.ws.inputMember = '';
  }

  addPreviousMembers() {
    // additionalMembers nimmt die zusätzlichen Members auf und fügt die bisherigen Members (einmal) hinzu
    if (!this.previousAdded) {
      this.previousAdded = true;
      this.clickedChannel.members.forEach((member) => {
        this.additionalMembers.push(member);
      });
    }
  }
  previewNumberMembers(): string {
    let numberMembers = this.clickedChannel.members.length;
    // let numberMembersString = numberMembers.toString();

    return numberMembers < 5 ? numberMembers.toString() : '4+';
  }

  saveName() {
    this.cs.updateChannel(
      { name: this.clickedChannel.name },
      this.clickedChannel
    );
    this.changeNameToInput();
  }

  saveDescription() {
    this.cs.updateChannel(
      { description: this.clickedChannel.description },
      this.clickedChannel
    );
    this.changeDescriptionToInput();
  }
}
