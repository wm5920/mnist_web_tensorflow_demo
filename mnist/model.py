import tensorflow as tf

# Softmax Regression Model
def regression(x):
    W = tf.Variable(tf.zeros([784, 10]), dtype=tf.float32)
    b = tf.Variable(tf.zeros([10]), dtype=tf.float32)
    y = tf.nn.softmax(tf.matmul(x, W) + b)
    return y, [W, b]


# Multilayer Convolutional Network
def convolutional(x, keep_prob):
    def conv2d(x, W):
        return tf.nn.conv2d(x, W, strides=[1, 1, 1, 1], padding='SAME')

    def max_pool_2x2(x):
        # stride [1, x_movement, y_movement, 1]
        # 接着定义池化pooling，为了得到更多的图片信息，padding时我们选的是一次一步，也就是strides[1]=strides[2]=1，这样得到的图片尺寸没有变化，
        # 而我们希望压缩一下图片也就是参数能少一些从而减小系统的复杂度，因此我们采用pooling来稀疏化参数，也就是卷积神经网络中所谓的下采样层。
        # pooling 有两种，一种是最大值池化，一种是平均值池化，本例采用的是最大值池化tf.max_pool()。池化的核函数大小为2x2，因此ksize=[1,2,2,1]，步长为2，因此strides=[1,2,2,1]:
        return tf.nn.max_pool(x, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')

    def weight_variable(shape):
        initial = tf.truncated_normal(shape, stddev=0.1)
        return tf.Variable(initial)

    def bias_variable(shape):
        initial = tf.constant(0.1, shape=shape)
        return tf.Variable(initial)

    # First Convolutional Layer
    # 我们需要处理我们的xs，把xs的形状变成[-1,28,28,1]，-1代表先不考虑输入的图片例子多少这个维度，
    # 后面的1是channel的数量，因为我们输入的图片是黑白的，因此channel是1，例如如果是RGB图像，那么channel就是3。
    x_image = tf.reshape(x, [-1, 28, 28, 1])
    # 卷积核patch的大小是5x5，因为黑白图片channel是1所以输入是1，输出是32个featuremap（经验值）
    W_conv1 = weight_variable([5, 5, 1, 32])
    b_conv1 = bias_variable([32])
    # relu激励函数
    h_conv1 = tf.nn.relu(conv2d(x_image, W_conv1) + b_conv1)
    h_pool1 = max_pool_2x2(h_conv1)
    # Second Convolutional Layer 加厚一层，图片大小14*14
    W_conv2 = weight_variable([5, 5, 32, 64])
    b_conv2 = bias_variable([64])
    h_conv2 = tf.nn.relu(conv2d(h_pool1, W_conv2) + b_conv2)
    h_pool2 = max_pool_2x2(h_conv2)
    # Densely Connected Layer 加厚一层，图片大小7*7
    W_fc1 = weight_variable([7 * 7 * 64, 1024])
    '''
    特征经验 2的n次方，如32,64,1024
    '''
    b_fc1 = bias_variable([1024])
    h_pool2_flat = tf.reshape(h_pool2, [-1, 7*7*64])
    h_fc1 = tf.nn.relu(tf.matmul(h_pool2_flat, W_fc1) + b_fc1)
    # Dropout
    h_fc1_drop = tf.nn.dropout(h_fc1, keep_prob)
    # Readout Layer
    W_fc2 = weight_variable([1024, 10])
    b_fc2 = bias_variable([10])
    y = tf.nn.softmax(tf.matmul(h_fc1_drop, W_fc2) + b_fc2)
    return y, [W_conv1, b_conv1, W_conv2, b_conv2, W_fc1, b_fc1, W_fc2, b_fc2]
