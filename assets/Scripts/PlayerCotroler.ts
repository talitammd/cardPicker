import {
  _decorator,
  Component,
  Vec3,
  EventKeyboard,
  input,
  Input,
  KeyCode,
  Animation,
} from "cc";
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass("PlayerController")
export class PlayerController extends Component {
  private _targetPos = new Vec3();
  private _curPos = new Vec3();
  private _startJump = false;
  private _jumpTime = 0;
  private _duration = 0;
  private _jumpStep = 0;

  // 记录分数
  private _score = 0;

  @property(Animation)
  animation: Animation = null;

  start() {
    // this.setInputActive(false);
  }

  setInputActive(active: boolean) {
    if (active) {
      input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    } else {
      input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
  }

  reset() {
    this._score = 0;
    this.node.setPosition(new Vec3(0, 0, 0));
    this._targetPos.set(0, 0, 0);
  }

  onKeyDown(event: EventKeyboard) {
    if (event.keyCode === KeyCode.KEY_Q) {
      this.jumpByStep(1);
    } else if (event.keyCode === KeyCode.KEY_W) {
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    if (this._startJump || !this.animation) {
      return;
    }
    this._startJump = true;
    this._jumpStep = step;
    this._jumpTime = 0;

    const clipName = step === 1 ? "oneStep" : "twoStep";
    const clip = this.animation.getState(clipName);
    this._duration = clip.duration;
    if (step === 1) {
      this.animation.play("oneStep");
    } else {
      this.animation.play("twoStep");
    }
    this.node.getPosition(this._curPos);
    Vec3.add(this._targetPos, this._curPos, new Vec3(step * 40, 0, 0));
    this._score += step;
  }

  onOnceJumpEnd() {
    // 派发了一个名为 JumpEnd 的事件，并将 _curMoveIndex 作为参数传递出去。
    // 某个节点派发的事件，只能用这个节点的引用去监听
    this.node.emit("JumpEnd", this._score);
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._jumpTime += deltaTime;
      if (this._jumpTime >= this._duration) {
        this.node.setPosition(this._targetPos);
        this._startJump = false;
        this.onOnceJumpEnd();
      } else {
        this.node.getPosition(this._curPos);
        Vec3.add(
          this._curPos,
          this._curPos,
          new Vec3((this._jumpStep * deltaTime * 40) / this._duration, 0, 0)
        );
        this.node.setPosition(this._curPos);
      }
    }
  }
}
