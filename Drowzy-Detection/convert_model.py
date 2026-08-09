import h5py
import json
import tensorflow as tf
from tensorflow import keras
import numpy as np

print("TensorFlow version:", tf.__version__)

# Read the HDF5 file directly
print("Reading model file...")
with h5py.File('models/fatigue_Detection_eyes.h5', 'r') as f:
    # Get model config
    if isinstance(f.attrs['model_config'], bytes):
        model_config = json.loads(f.attrs['model_config'].decode('utf-8'))
    else:
        model_config = json.loads(f.attrs['model_config'])
    
    print("\nOriginal Model Config:")
    print(json.dumps(model_config, indent=2))
    
    # Fix the config - remove problematic fields
    def fix_layer_config(layer_config):
        if 'config' in layer_config:
            config = layer_config['config']
            
            # Fix InputLayer
            if layer_config['class_name'] == 'InputLayer':
                if 'batch_shape' in config:
                    batch_shape = config.pop('batch_shape')
                    if batch_shape and len(batch_shape) > 1:
                        config['batch_input_shape'] = batch_shape
            
            # Fix dtype for all layers
            if 'dtype' in config:
                if isinstance(config['dtype'], dict):
                    config['dtype'] = 'float32'
            
            # Fix nested configs (initializers, etc.)
            for key in ['kernel_initializer', 'bias_initializer', 'kernel_regularizer', 
                       'bias_regularizer', 'activity_regularizer', 'kernel_constraint', 
                       'bias_constraint']:
                if key in config and isinstance(config[key], dict):
                    if 'config' in config[key]:
                        config[key]['config'] = {k: v for k, v in config[key]['config'].items() 
                                                if k != 'dtype'}
        
        return layer_config
    
    # Fix all layers
    if 'config' in model_config:
        if 'layers' in model_config['config']:
            for i, layer in enumerate(model_config['config']['layers']):
                model_config['config']['layers'][i] = fix_layer_config(layer)
    
    print("\nFixed Model Config:")
    print(json.dumps(model_config, indent=2))

# Build model from fixed config
print("\nBuilding model from fixed config...")
try:
    model = keras.models.model_from_json(json.dumps(model_config))
    print("✓ Model architecture created!")
    
    # Load weights
    print("Loading weights...")
    with h5py.File('models/fatigue_Detection_eyes.h5', 'r') as f:
        if 'model_weights' in f:
            model.load_weights('models/fatigue_Detection_eyes.h5')
        else:
            # Try loading layer by layer
            for layer in model.layers:
                if layer.name in f:
                    layer.set_weights([f[layer.name][w][()] for w in f[layer.name]])
    
    print("✓ Weights loaded!")
    
    # Show model
    print("\nModel Summary:")
    model.summary()
    
    # Save in new format
    print("\nSaving model in compatible format...")
    model.save('models/fatigue_Detection_eyes_v2.h5')
    print("✓ Model saved as fatigue_Detection_eyes_v2.h5")
    
    # Test loading
    print("\nTesting new model...")
    test_model = keras.models.load_model('models/fatigue_Detection_eyes_v2.h5', compile=False)
    print("✓ New model loads successfully!")
    
    # Test prediction
    print("\nTesting prediction...")
    test_input = np.random.rand(1, 24, 24, 1).astype(np.float32)
    prediction = test_model.predict(test_input, verbose=0)
    print(f"✓ Prediction works! Output shape: {prediction.shape}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    
    print("\n" + "="*50)
    print("ALTERNATIVE: Creating a compatible model from scratch")
    print("="*50)
    
    # Create a simple CNN model that matches the expected input/output
    print("\nCreating new model architecture...")
    model = keras.Sequential([
        keras.layers.Input(shape=(24, 24, 1)),
        keras.layers.Conv2D(32, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Flatten(),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(2, activation='softmax')  # 2 classes: Open, Close
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    print("\n⚠️  WARNING: Created new model architecture (untrained)")
    print("This model needs to be trained on your dataset.")
    print("\nModel Summary:")
    model.summary()
    
    # Save it anyway for testing
    model.save('models/fatigue_Detection_eyes_new.h5')
    print("\n✓ Saved as fatigue_Detection_eyes_new.h5")
    print("\nNOTE: You'll need to train this model or find a compatible pre-trained model.")