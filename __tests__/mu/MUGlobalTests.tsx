import { MUGlobal } from '../../src/mu/MUGlobal';

test('increase tests', () => {
    // Arrange
    const paddings = { sx: 2, sm: 3, key: 'a' };

    // Act
    const result = MUGlobal.increase(paddings, 2);

    // Assert
    expect(paddings).toHaveProperty('sx', 2);
    expect(result).toHaveProperty('sx', 4);
    expect(result).toHaveProperty('sm', 5);
});
