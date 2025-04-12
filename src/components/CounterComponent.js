import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from '../store/counterSlice';
import { View, Text, Button } from 'react-native';

const CounterComponent = () => {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={() => dispatch(increment())} />
      <Button title="Decrement" onPress={() => dispatch(decrement())} />
      <Button title="Increment by 5" onPress={() => dispatch(incrementByAmount(5))} />
    </View>
  );
};

export default CounterComponent;
