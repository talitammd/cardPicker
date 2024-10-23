import {
  _decorator,
  CCInteger,
  Component,
  input,
  instantiate,
  Label,
  Node,
  Prefab,
  Vec3,
  Input,
} from "cc";
import { PlayerController } from "./PlayerCotroler";
const { ccclass, property } = _decorator;
enum GameState {
  GS_INIT,
  GS_PLAY,
  GS_END,
}
enum BlockType {
  BT_Empty = 0,
  BT_Box = 1,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Prefab })
  public boxPrefab: Prefab | null = null;

  @property({ type: CCInteger })
  public boxLength: number = 50;
  private _boxList: BlockType[] = [];

  @property({ type: Node })
  public startMenu: Node | null = null;

  @property({ type: PlayerController })
  public playerCtrl: PlayerController | null = null;

  @property({ type: Label })
  public stepsLabel: Label | null = null;

  spawnBlockByType(type: BlockType) {
    if (!this.boxPrefab) {
      return null;
    }
    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_Box:
        block = instantiate(this.boxPrefab);
        break;
      default:
        break;
    }
    return block;
  }

  generateBox() {
    this.node.removeAllChildren();
    this._boxList = [];
    this._boxList.push(BlockType.BT_Box);

    for (let i = 1; i < this.boxLength; i++) {
      if (this._boxList[i - 1] === BlockType.BT_Empty) {
        this._boxList.push(BlockType.BT_Box);
      } else {
        this._boxList.push(
          Math.random() > 0.5 ? BlockType.BT_Box : BlockType.BT_Empty
        );
      }
    }

    for (let j = 0; j < this._boxList.length; j++) {
      let block: Node | null = this.spawnBlockByType(this._boxList[j]);
      if (block) {
        this.node.addChild(block);
        block.setPosition(j * 40, 0, 0);
      }
    }
  }

  setCurrentState(state: GameState) {
    switch (state) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAY:
        this.play();
        break;
      case GameState.GS_END:
        break;
    }
  }

  onPlayerJumpEnd(score: number) {
    if (this.stepsLabel) {
      this.stepsLabel.string =
        "" + (score >= this.boxLength ? this.boxLength : score);
    }
    this.checkResult(score);
  }

  play() {
    if (this.startMenu) {
      this.startMenu.active = false;
    }

    if (this.stepsLabel) {
      this.stepsLabel.string = "0"; // 将步数重置为0
    }

    setTimeout(() => {
      if (this.playerCtrl) {
        this.playerCtrl.setInputActive(true);
      }
      console.log(111);
    }, 0.1);
  }

  init() {
    if (this.startMenu) {
      this.startMenu.active = true;
    }
    this.node.removeAllChildren();
    this.generateBox();

    if (this.playerCtrl) {
      this.playerCtrl.setInputActive(true);
      this.playerCtrl.node.setPosition(0, 0, 0);
      this.playerCtrl.reset();
    }
  }

  onStartButtonClicked() {
    this.setCurrentState(GameState.GS_PLAY);
  }

  checkResult(score: number) {
    if (score < this.boxLength) {
      if (this._boxList[score] == BlockType.BT_Empty) {
        this.setCurrentState(GameState.GS_INIT);
      }
    } else {
      this.setCurrentState(GameState.GS_INIT);
    }
  }

  start() {
    this.setCurrentState(GameState.GS_INIT);
    this.playerCtrl?.node.on("JumpEnd", this.onPlayerJumpEnd, this);
  }

  update(deltaTime: number) {}
}
