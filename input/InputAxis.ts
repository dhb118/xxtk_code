import { Input } from "./Input";

export enum AxisType {
	Button,
	Mouse,
	JoyStick,
}

export class InputAxis {
	_type: AxisType = AxisType.Button;
	_name: string;
	_value: number = 0;
	_rawValue: number = 0;
	_axis: number = 0;
	_sensitivity: number = 0.1;
	_dead = 0.01; ///< Size of the analog dead zone. All analog device values within this range map to neutral
	_positiveButton = 0; ///< Button to be pressed for movement in negative direction
	_negativeButton = 0; ///< Button to be pressed for movement in positive direction
	_altPositiveButton = 0; ///< alternative Button to be pressed for movement in negative direction
	_altNegativeButton = 0; ///< alternative Button to be pressed for movement in positive direction
	_snap = false; ///< If we have input in opposite direction of current, do we jump to neutral and continue from there?
	_gravity = 0; ///< Speed (in units/sec) that the output value falls towards neutral when device at rest

	constructor(name: string) {
		this.name = name;
	}

	get type() {
		return this._type;
	}

	get name() {
		return this._name;
	}
	set name(name: string) {
		this._name = name;
	}

	get value() {
		return this._value;
	}

	get valueRaw() {
		return this._rawValue;
	}

	/// Set the mouse or joystick axis for this input.
	/// 0 = x, 1 = y
	set axis(a: number) {
		this._axis = a;
	}

	get axis() {
		return this._axis;
	}

	MakeMouse(a: number) {
		this._type = AxisType.Mouse;
		this._axis = a;
		this._dead = 0.0;
		this._sensitivity = 0.1;
	}

	MakeAnalogKey(pos: number, neg: number, altpos: number, altnegpos: number) {
		this._positiveButton = pos;
		this._negativeButton = neg;
		this._altPositiveButton = altpos;
		this._altNegativeButton = altnegpos;
		this._type = AxisType.Button;
		this._sensitivity = 3;
		this._gravity = 3;
		this._snap = true;
	}

	MakeJoystick(axis: number) {
		this._type = AxisType.JoyStick;
		this._axis = axis;
		this._sensitivity = 1.0;
		this._dead = 0.19;
		this._gravity = 0.0;
		this._snap = false;
	}

	update(input: Input, delteTime: number) {
		switch (this._type) {
			case AxisType.Mouse:
				{
					const delta = input.mouseDelta;
					if (this._axis == 0) this._value = delta.x;
					else if (this._axis == 1) this._value = delta.y;
					else this._value = input.mouseScrollDelta.y;

					this._rawValue = this._value;
					this._value *= this._sensitivity;
				}
				break;
			case AxisType.Button:
				{
					const posFlag = input.GetKey(this._positiveButton) || input.GetKey(this._altPositiveButton);
					const negFlag = input.GetKey(this._negativeButton) || input.GetKey(this._altNegativeButton);
					this._rawValue = 0.0;

					// Lock if both up and down are held
					if (!(posFlag && negFlag)) {
						if (posFlag) {
							if (this._snap && this._value < 0.0) this._value = 0.0;
							else this._value += this._sensitivity * delteTime;
							if (this._value < 0.0) this._value += this._gravity * delteTime;

							this._value = Math.min(1.0, this._value);
							this._rawValue = 1.0;
						} else if (negFlag) {
							if (this._snap && this._value > 0.0) this._value = 0.0;
							else this._value -= this._sensitivity * delteTime;
							if (this._value > 0.0) this._value -= this._gravity * delteTime;

							this._value = Math.max(-1.0, this._value);
							this._rawValue = -1.0;
						} else {
							if (this._gravity) {
								if (this._value > 0) {
									this._value -= this._gravity * delteTime;
									if (this._value < 0) this._value = 0;
								} else if (this._value < 0) {
									this._value += this._gravity * delteTime;
									if (this._value > 0) this._value = 0;
								}
							}
						}
					}
				}

				break;
			case AxisType.JoyStick:
				{
					this._value = input.GetJoystickPosition(0, this._axis);
					this._rawValue = this._value;
					this._value *= this._sensitivity;

					const v = this._value;
					const dead = this._dead;
					if (v < dead && v > -dead) {
						this._value = 0;
					} else if (v > 0) {
						this._value = 1;
					} else {
						this._value = -1;
					}
				}
				break;
		}
	}
}
