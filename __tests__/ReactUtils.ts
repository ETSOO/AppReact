import { ReactUtils } from '../src/app/ReactUtils';

test('Tests for ReactUtils.formatInputValue', () => {
    expect(ReactUtils.formatInputValue([1, 'a'])).toEqual([1, 'a']);
    expect(ReactUtils.formatInputValue(true)).toEqual('true');
});
